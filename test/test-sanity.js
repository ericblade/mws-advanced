const fs = require('fs');
const errors = require('../lib/errors');
const MWS = require('..');

describe('mws-advanced sanity', () => {
    // TODO: write tests that test all configuration options individually, and defaults,
    // much like was just written in mws-simple
    // TODO: do we need to write a test that tests authToken if it is present?
    // TODO: write parseEndpoint tester
    it('exports constants', () => {
        expect(MWS.constants).to.be.an('object').that.has.keys([
            'MWS_MARKETPLACES', 'MWS_ENDPOINTS', 'MARKET_CURRENCY',
        ]);
        expect(MWS.constants.MWS_MARKETPLACES).to.be.an('object');
        expect(MWS.constants.MWS_ENDPOINTS).to.be.an('object');
        expect(MWS.constants.MARKET_CURRENCY).to.be.an('object');
    });
    describe('mws.init', () => {
        const initTestParams = {
            accessKeyId: 'testKeyId',
            secretAccessKey: 'testSecret',
            merchantId: 'testMerchantId',
            authToken: 'authToken',
        };
        it('init returns a configured mws object', (done) => {
            const client = MWS.init(initTestParams);
            expect(client).to.be.an('object');
            expect(client).to.include.all.keys(
                'host',
                'port',
                'accessKeyId',
                'secretAccessKey',
                'merchantId',
                'authToken',
            );
            done();
        });
        it('new MWS works', (done) => {
            const client = new MWS(initTestParams);
            expect(client.mws).to.be.an('object');
            expect(client.mws).to.include.all.keys(
                'host',
                'port',
                'accessKeyId',
                'secretAccessKey',
                'merchantId',
                'authToken',
            );
            done();
        });
        it('init() works when called on a MWSAdvanced instance', (done) => {
            const client = new MWS();
            const x = client.init(initTestParams);
            expect(x.accessKeyId).to.equal(initTestParams.accessKeyId);
            expect(client.mws.accessKeyId).to.equal(initTestParams.accessKeyId);
            done();
        });
        it('multiple instances dont become confused at init', (done) => {
            const client1 = new MWS(initTestParams);
            const client2 = new MWS({ ...initTestParams, accessKeyId: 'Junk' });
            expect(client1.mws.accessKeyId).to.equal(initTestParams.accessKeyId);
            expect(client2.mws.accessKeyId).to.equal('Junk');
            done();
        });
        it('multiple instances, created asynchronously, connect to the intended marketplace/region', async () => {
            const allInitParams = [initTestParams, { ...initTestParams, accessKeyId: 'Junk', host: 'https://mws.amazonservices.jp' }];

            const createMWSAdvancedAsync = async (initParams) => {
                const mws = new MWS(initParams);
                return mws;
            };

            const allMWSObjectsUsedForRequest = await Promise.all(allInitParams.map(async (initParams) => {
                const MWSClient = createMWSAdvancedAsync(initParams);
                MWSClient.mockRequest = async () => {
                    return Promise.resolve(MWSClient);
                };
                return MWSClient.mockRequest();
            }));

            expect(allMWSObjectsUsedForRequest[0]).not.to.deep.equal(allMWSObjectsUsedForRequest[1]);
        });
        it('init can pick up environment variables for keys', (done) => {
            const oldkey = process.env.MWS_ACCESS_KEY;
            process.env.MWS_ACCESS_KEY = 'testAccessKey';
            const oldSecret = process.env.MWS_SECRET_ACCESS_KEY;
            process.env.MWS_SECRET_ACCESS_KEY = 'testSecret';
            const oldMerchant = process.env.MWS_MERCHANT_ID;
            process.env.MWS_MERCHANT_ID = 'testMerchant';
            const client = MWS.init();
            expect(client.accessKeyId).to.equal('testAccessKey');
            expect(client.secretAccessKey).to.equal('testSecret');
            expect(client.merchantId).to.equal('testMerchant');
            process.env.MWS_ACCESS_KEY = oldkey;
            process.env.MWS_SECRET_ACCESS_KEY = oldSecret;
            process.env.MWS_MERCHANT_ID = oldMerchant;
            done();
        });
        it('init marketplaces', (done) => {
            let client = MWS.init({ region: 'CN', marketplace: 'CN' });
            expect(client.host).to.equal('mws.amazonservices.com.cn');
            client = MWS.init({ region: 'AU', marketplace: 'AU' });
            expect(client.host).to.equal('mws.amazonservices.com.au');
            client = MWS.init({ region: 'JP', marketplace: 'JP' });
            expect(client.host).to.equal('mws.amazonservices.jp');
            client = MWS.init({ region: 'IN', marketplace: 'IN' });
            expect(client.host).to.equal('mws.amazonservices.in');
            client = MWS.init({ region: 'EU', marketplace: 'DE' });
            expect(client.host).to.equal('mws-eu.amazonservices.com');
            client = MWS.init({ region: 'BR', marketplace: 'BR' });
            expect(client.host).to.equal('mws.amazonservices.com');
            client = MWS.init({ region: 'NA', marketplace: 'US' });
            expect(client.host).to.equal('mws.amazonservices.com');
            done();
        });
        it('init w/ junk marketplace uses default host', (done) => {
            const client = MWS.init({ region: 'TestJunk' });
            expect(client.host).to.equal('mws.amazonservices.com');
            done();
        });
    });
    describe('callEndpoint functions (requires keys)', function () {
        const testCall = 'GetMatchingProductForId';
        const testParams = {
            MarketplaceId: 'ATVPDKIKX0DER',
            IdType: 'ASIN',
            IdList: ['B005NK7VTU'],
        };
        beforeEach(function () {
            if (SkipAPITests) {
                this.skip();
            }
        });
        it('tester provided likely correct keys', (done) => {
            expect(
                MWSAPIKeys,
                'provide a keys.json file or environment variables with accessKeyId, secretAccessKey, merchantId to test API',
            ).to.include.all.keys(
                'accessKeyId',
                'secretAccessKey',
                'merchantId',
            );
            done();
        });
        it('callEndpoint functions', () => {
            MWS.init(MWSAPIKeys);
            return expect(MWS.callEndpoint(testCall, testParams)).to.be.fulfilled;
        });
        it('callEndpoint functions using new MWS()', () => {
            const test = new MWS(MWSAPIKeys);
            return expect(test.callEndpoint(testCall, testParams)).to.be.fulfilled;
        });
        // writing this test with an assumption that converting from a single API instance to
        // a multiple instance system could end up with access objects getting swapped.
        it('multiple instances dont become confused at callEndpoint', async () => {
            const test1 = new MWS(MWSAPIKeys);
            const test2 = new MWS({
                accessKeyId: 'testKeyId',
                secretAccessKey: 'testSecret',
                merchantId: 'testMerchantId',
                authToken: 'authToken',
            });
            const res = await test1.callEndpoint(testCall, testParams);
            expect(res).to.not.be.undefined;

            try {
                const x = await test2.callEndpoint(testCall, testParams);
                // this SHOULD be an assert, but i don't think we have assert loaded here.
                return expect(x).to.equal(undefined);
            } catch (err) {
                // expect(err).to.be.an.instanceOf(test2.mws.ServerError);
                return expect(err.code).to.equal(403); // Forbidden
            }
        });
        it('callEndpoint saveRaw/saveParsed options', async () => {
            try {
                fs.unlinkSync('./testRaw.json');
                fs.unlinkSync('./testParsed.json');
            } catch (err) {
                //
            }
            MWS.init(MWSAPIKeys);
            await MWS.callEndpoint(testCall, testParams, { noFlatten: true, saveRaw: './testRaw.json', saveParsed: './testParsed.json' });
            expect(fs.existsSync('./testRaw.json')).to.equal(true);
            expect(fs.existsSync('./testParsed.json')).to.equal(true);
            try {
                fs.unlinkSync('./testRaw.json');
                fs.unlinkSync('./testParsed.json');
            } catch (err) {
                //
            }
        });
        it('callEndpoint returnRaw option', async () => {
            MWS.init(MWSAPIKeys);
            const x = await MWS.callEndpoint(testCall, testParams, { returnRaw: true });
            expect(x).to.be.an('Object');
            expect(x).to.include.all.keys('GetMatchingProductForIdResponse');
            expect(x.GetMatchingProductForIdResponse).to.include.all.keys('$', 'GetMatchingProductForIdResult', 'ResponseMetadata');
            return true;
        });
        it('callEndpoint noFlatten option', async () => {
            MWS.init(MWSAPIKeys);
            const x = await MWS.callEndpoint(testCall, testParams, { noFlatten: true });
            expect(x).to.be.an('Array');
            expect(x[0]).to.include.all.keys('$', 'Products');
            return true;
        });
        it('callEndpoint throws on unknown endpoint', () => {
            return expect(MWS.callEndpoint('/test/endpoint', {})).to.be.rejectedWith(errors.InvalidUsage);
        });
        it('callEndpoint throws on garbage parameters', () => {
            return expect(MWS.callEndpoint('GetOrder', { junkTest: true })).to.be.rejectedWith(errors.ValidationError);
        });
    });
});
