const sleep = require('../lib/util/sleep');
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

    describe.only('Class Queue', function () {
        let q;
        beforeEach(() => {
            q = new Queue(
                {
                    maxInFlight: 6,
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

        it('Should add an item (or items) to the queue', () => {
            q.addToQueue = 'TEST_ITEM';
            expect(q.getQueue).to.deep.equal(['TEST_ITEM']);

            q.addToQueue = 'TEST_ITEM1';
            q.addToQueue = 'TEST_ITEM2';
            expect(q.getQueue).to.deep.equal(['TEST_ITEM', 'TEST_ITEM1', 'TEST_ITEM2']);

            q.addToQueue = ['TEST_ITEM3', 'TEST_ITEM4'];
            expect(q.getQueue).to.deep.equal([
                'TEST_ITEM', 'TEST_ITEM1', 'TEST_ITEM2', 'TEST_ITEM3', 'TEST_ITEM4',
            ]);
        });

        it('Should run all queued items', () => {
            const mockItemRunner = (() => {
                let count = 0;
                q.complete();
                return () => {
                    count += 1;
                    return count;
                };
            })();

            q.addToQueue = [
                { run: mockItemRunner },
                { run: mockItemRunner },
                { run: mockItemRunner },
            ];
            q.runQueue();
            setImmediate(() => expect(mockItemRunner() - 1).to.equal(3));
        });

        it('Should throttle request', async () => {
            const SleepMockedQueue = new Queue(
                {
                    maxInFlight: 5,
                    restoreRate: 60,
                    api: { // MOCK MWS
                        doRequest: async () => {
                            await sleep(100);
                            return Promise.resolve('TEST_RESULT');
                        },
                    },
                },
                () => {},
            );

            for (let i = 0; i < 10; i += 1) {
                // eslint-disable-next-line no-await-in-loop
                await SleepMockedQueue.request({}, {});
            }
            expect(SleepMockedQueue.getQueue).to.deep.equal([]);
        });

        it.only('Should be able to deal with a throtteling Server Error', async () => {
            const throttleErrorCode = 503;
            class MockedServerError extends Error {
                constructor(message, code, body) {
                    super(message);
                    if (Error.captureStackTrace) Error.captureStackTrace(this, MockedServerError);
                    this.code = code;
                    this.body = body;
                }
            }
            function* mockDoRequestGenerator() {
                yield Promise.reject(
                    new MockedServerError('TEST_ERROR', throttleErrorCode, 'TEST'),
                );
                yield Promise.resolve('TEST_RESULT');
                yield Promise.reject(
                    new MockedServerError('TEST_ERROR', throttleErrorCode, 'TEST'),
                );
                yield Promise.reject(
                    new MockedServerError('TEST_ERROR', throttleErrorCode, 'TEST'),
                );
                yield Promise.resolve('TEST_RESULT');
            }
            const mockedDoRequestGenerator = mockDoRequestGenerator();

            const SleepMockedQueue = new Queue(
                {
                    category: 'TEST',
                    action: 'SHOUT_TEST',
                    maxInFlight: 5,
                    restoreRate: 60,
                    api: { // MOCK MWS
                        doRequest: async () => {
                            await sleep(100);
                            return mockedDoRequestGenerator.next().value;
                        },
                        mws: {
                            ServerError: MockedServerError,
                        },
                    },
                },
                () => {},
            );

            for (let i = 0; i < 2; i += 1) {
                // eslint-disable-next-line no-await-in-loop
                await SleepMockedQueue.request({}, {});
            }
            expect(SleepMockedQueue.getQueue).to.deep.equal([]);
        });
    });

    describe('Class QueueItem', function () {

    });
});
