const { Queue, QueueScheduler } = require('../lib/endpoints/Queue');

describe('Testing Queues', function () {
    describe('Class QueueScheduler', function () {
        let QueueSchedule;
        beforeEach(() => {
            QueueSchedule = new QueueScheduler();
        });

        it('Should get an empty queue (i.e. Map object)', function () {
            expect(QueueSchedule.getQueue('test/test/test')).to.be.undefined;
        });

        it('Should register a new queues', function () {
            QueueSchedule.registerQueue('test', 'test/test/test');
            QueueSchedule.registerQueue('test1', 'test/test/test1');
            expect(QueueSchedule.getQueue('test/test/test')).to.equal('test');
            expect(QueueSchedule.getQueue('test/test/test1')).to.equal('test1');
        });


        it('Should delete a new queue', function () {
            QueueSchedule.registerQueue('test', 'test/test/test');
            QueueSchedule.registerQueue('test1', 'test/test/test1');
            QueueSchedule.deleteQueue('test/test/test');
            expect(QueueSchedule.getQueue('test/test/test')).to.be.undefined;
            expect(QueueSchedule.getQueue('test/test/test1')).to.equal('test1');
        });

        it('Should throw an error', async () => {
            const queueName = 'test/test/test';
            const q = new Queue(
                {
                    api: {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        doRequest: () => Promise.reject({ error: new Error('ERROR') }),
                        mws: {
                            ServerError: Error,
                        },
                    },
                },
                () => QueueSchedule.deleteQueue(queueName),
            );
            QueueSchedule.registerQueue(q, queueName);
            expect(q.request()).to.be.rejected;
        });

        it('Should create an empty queue', async () => {
            const queueName = 'test/test/test';
            const q = new Queue(
                {
                    api: {
                        doRequest: () => Promise.resolve(
                            'test',
                        ),
                    },
                },
                () => QueueSchedule.deleteQueue(queueName),
            );
            QueueSchedule.registerQueue(q, queueName);
            expect(QueueSchedule.getQueue(queueName)).to.equal(q);
            await q.request();
            setImmediate(() => expect(QueueSchedule.getQueue(queueName)).to.be.undefined);
        });
    });

    describe('Class Queue', function () {
        let q;
        beforeEach(() => {
            q = new Queue(
                {
                    api: { // MOCK MWS
                        doRequest: () => Promise.resolve(
                            'TEST_RESULT',
                        ),
                    },
                },
                () => {},
            );
        });
        it('Should run a single request', async () => {
            const received = await q.request();
            const expected = 'TEST_RESULT';
            expect(received).to.equal(expected);
        });
    });

    describe('Class QueueItem', function () {});
});
