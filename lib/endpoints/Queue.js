// TODO: Product category at least has a hourly request quota that is
// not tracked anywhere currently.

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
    }) {
        this.api = api;
        this.category = category;
        this.action = action;
        this.params = params;
        this.options = options;
        this.resolver = resolver;
        this.rejecter = rejecter;
        this.onComplete = onComplete;

        this.run = this.run.bind(this);
    }

    async run() {
        try {
            const res = await this.api.requestPromise(this.params, this.options);
            this.resolver(res);
            this.onComplete();
        } catch (err) {
            this.rejecter(err);
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

        this.throttle = this.throttle.bind(this);
        this.setThrottleTimer = this.setThrottleTimer.bind(this);
        this.onQueueTimer = this.onQueueTimer.bind(this);
        this.drainQueue = this.drainQueue.bind(this);
        this.complete = this.complete.bind(this);
        this.runQueue = this.runQueue.bind(this);
        this.request = this.request.bind(this);
    }

    throttle() {
        console.warn('* THROTTLE HIT');
        this.setThrottleTimer();
    }

    setThrottleTimer() {
        if (this.queueTimer) {
            // already running, so we shouldn't have sent any more requests
            // since we set the timer, so we shouldn't need to re-set the timer
            return;
        }
        this.queueTimer = setTimeout(this.onQueueTimer, (this.restoreRate || 1) * 60 * 1000);
    }

    onQueueTimer() {
        console.warn('* throttle timeout, draining');
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
        while (this.queue.length && this.inFlight < this.maxInFlight) {
            this.runQueue();
        }
        if (this.queue.length >= this.maxInFlight) {
            this.setThrottleTimer();
        }
        // console.warn('* drainQueue at end', this.queue.length, this.inFlight);
    }

    complete() {
        this.inFlight -= 1;
        this.drainQueue();
    }

    // TODO: ideally we should move these items into a 'running' queue versus a 'waiting' queue
    // rather than removing them from the waiting queue, so that they can be re-run inside this
    // queue, should they fail. also, we should store the promise in the QueueItem, so we can
    // monitor it's progress here, instead of doing it outside, in callEndpoint as it does
    // currently.  That is for another day, though.
    runQueue() {
        if (this.queueTimer) {
            console.warn('* ignoring run request, throttle timer running');
        }
        const item = this.queue.shift();
        if (item) {
            this.inFlight += 1;
            item.run();
        }
    }

    request(params, options) {
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
            });
            this.queue.push(action);
            setImmediate(this.drainQueue);
            // if (this.inFlight < this.maxInFlight || !this.maxInFlight) {
            //     this.runQueue();
            // }
        });
    }
}

module.exports = Queue;
