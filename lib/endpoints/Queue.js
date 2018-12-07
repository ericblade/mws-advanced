// TODO: Product category at least has a hourly request quota that is
// not tracked anywhere currently.

// TODO: so, it turns out that the throttle headers don't come through on throttled requests
// only on the request that was last successful.
// So, we need to fix mws-simple to give headers (does it already do that?) for non-throttled
// requests, so that we can keep track of actual throttle in Queue.
// We need to do this because we can not guarantee that our Queue instance is the only
// thing in existence that is potentially affecting Quota (previous instances may have, or
// completely external accesses from other tools), so we need to make sure that our data is
// adjusted to compensate for what Amazon tells us regarding quota information.

class QueueItem {
    constructor({
        api,
        category,
        action,
        params,
        options,
        resolver,
        rejecter,
        onComplete,
        onFailure,
    }) {
        this.api = api;
        this.category = category;
        this.action = action;
        this.params = params;
        this.options = options;
        this.resolver = resolver;
        this.rejecter = rejecter;
        this.onComplete = onComplete;
        this.onFailure = onFailure;

        this.run = this.run.bind(this);
    }

    async run() {
        try {
            const res = await this.api.requestPromise(this.params, this.options);
            this.resolver(res);
            this.onComplete();
        } catch (err) {
            // notify Queue that the request failed, so Queue can determine if it should reject
            // or retry.
            this.onFailure(err, this);
        }
    }
}

class Queue {
    constructor({
        api,
        category,
        action,
        maxInFlight,
        restoreRate,
    }) {
        this.api = api;
        this.category = category;
        this.action = action;
        this.inFlight = 0;
        this.maxInFlight = maxInFlight || 200;
        this.restoreRate = restoreRate || 0;
        this.queue = [];
        this.queueTimer = null;
        // toggle this to true when we hit a throttle, toggle false when queue inFlight === 0
        // TODO: remove this when we can keep track of throttling from headers
        this.singleDrain = false;

        this.throttle = this.throttle.bind(this);
        this.setThrottleTimer = this.setThrottleTimer.bind(this);
        this.onQueueTimer = this.onQueueTimer.bind(this);
        this.drainQueue = this.drainQueue.bind(this);
        this.complete = this.complete.bind(this);
        this.fail = this.fail.bind(this);
        this.runQueue = this.runQueue.bind(this);
        this.request = this.request.bind(this);
    }

    throttle() {
        this.singleDrain = true;
        this.setThrottleTimer();
    }

    setThrottleTimer() {
        if (this.queueTimer) {
            // already running, so we shouldn't have sent any more requests
            // since we set the timer, so we shouldn't need to re-set the timer
            return;
        }
        const time = (((60 / this.restoreRate) || 1) * 1000) + 250;
        console.warn('* setThrottleTimer', time);
        this.queueTimer = setTimeout(this.onQueueTimer, time);
    }

    onQueueTimer() {
        // console.warn('* throttle timeout, draining');
        this.queueTimer = null;
        this.runQueue();
    }

    drainQueue() {
        if (this.queueTimer) {
            // console.warn('* ignoring drain request, waiting on throttle timer');
            return;
        }
        if (!this.queue.length) {
            // console.warn('* ignoring drain request, queue empty');
            return;
        }

        // TODO: this should schedule staggered runs, so that if we get another
        // throttle response, we get halted.
        // console.warn('* drainQueue length at start', this.queue.length);

        if (!this.singleDrain) {
            while (this.queue.length && this.inFlight < this.maxInFlight) {
                this.runQueue();
            }
        } else {
            this.runQueue();
        }
        // console.warn('* drainQueue at end', this.queue.length, this.inFlight);
    }

    complete() {
        this.inFlight -= 1;
        if (this.inFlight < 1) {
            this.inFlight = 0;
            if (this.singleDrain) {
                // assume quota was blown, enforce a restoreRate timeout before clearing singleDrain
                const time = (((60 / this.restoreRate) || 1) * 1000) + 250;
                setTimeout(() => { this.singleDrain = false; }, time);
            }
        }
        this.drainQueue();
    }

    fail(err, failedItem) {
        // console.warn('* Queue.fail', failedItem.category, failedItem.action, err);
        const { error } = err;
        if (error instanceof this.api.mws.ServerError) {
            if (error.code === 503) {
                console.warn('* retry -- throttle hit for', failedItem.category, failedItem.action);
                this.throttle();
                this.queue.unshift(failedItem);
                return;
            }
        }
        // console.warn('* non-throttle failure', error);
        failedItem.rejecter(err);
        this.complete();
    }

    runQueue() {
        if (this.queueTimer) {
            // console.warn('* ignoring run request, throttle timer running');
            return;
        }
        // console.warn('* runQueue');
        const item = this.queue.shift();
        if (item) {
            this.inFlight += 1;
            item.run();
        }
    }

    request(params, options) {
        // console.warn('* request', this.category, this.action);
        return new Promise((resolve, reject) => {
            const action = new QueueItem({
                api: this.api,
                category: this.category,
                action: this.action,
                params,
                options,
                resolver: resolve,
                rejecter: reject,
                onComplete: this.complete,
                onFailure: this.fail,
            });
            this.queue.push(action);
            setImmediate(this.drainQueue);
        });
    }
}

module.exports = Queue;
