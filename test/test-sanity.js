// no-extraneous-dependencies would force us to put chai as a non-dev dep
// no-undef breaks the standard pattern with chai, apparently
// no-unused-expressions also breaks standard chai patterns
// remove prefer-destructuring here because for some reason eslint is failing to handle it with require()
// remove prefer-arrow-function because we need to use regular functions in places to access this.skip()

/* eslint-disable import/no-extraneous-dependencies,no-undef,no-unused-expressions,prefer-destructuring,prefer-arrow-callback,global-require,no-empty,func-names,arrow-body-style */

process.env.NODE_ENV = 'testing';

const fs = require('fs'); // yes i know i probably shouldn't be writing files in tests. sorry.

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const sleep = require('../lib/util/sleep');
const isType = require('../lib/validation').isType;
const validate = require('../lib/validation').validate;
const validateAndTransformParameters = require('../lib/validation').validateAndTransformParameters;
const flattenResult = require('../lib/flatten-result').flattenResult;
const { digResponseResult } = require('../lib/dig-response-result');

const listMarketplacesData = require('./ListMarketplaces.json');
const errorData = require('./errorData.json');

const transformers = require('../lib/util/transformers');

describe('Sanity', () => {
    it('true is true', (done) => {
        expect(true).to.equal(true);
        done();
    });
});

describe('Misc Utils', () => {
    it('sleep() 1sec works', async () => {
        const startDate = Date.now();
        await sleep(1000);
        expect(Date.now() - startDate).to.be.approximately(1000, 100, 'slept for 1sec');
    });
    // TODO: we should test flattenResult using actual amazon data
    // as well, to validate real world usage.
    it('flattenResult returns array when given array', (done) => {
        const result = flattenResult([{ test: 1, test2: 2 }]);
        expect(result).to.be.an('array').with.lengthOf(1);
        expect(result[0]).to.deep.equal({ test: 1, test2: 2 });
        done();
    });
    it('flattenResult returns object when given object', (done) => {
        const result = flattenResult({ test: 1, test2: 2 });
        expect(result).to.deep.equal({ test: 1, test2: 2 });
        done();
    });
    it('flattenResult() returns flat results', (done) => {
        const result = flattenResult({
            test: ['test'],
            test2: ['test2-a', 'test2-b'],
            test3: [
                {
                    test4: ['test4-a'],
                    test5: ['test5-a', 'test5-b'],
                },
            ],
        });
        expect(result).to.be.an('object');
        expect(result).to.include.all.keys(
            'test',
            'test2',
            'test3',
        );
        expect(result.test).to.equal('test');
        expect(result.test2).to.have.lengthOf(2);
        expect(result.test3).to.be.an('object').include.all.keys(
            'test4',
            'test5',
        );
        expect(result.test3.test4).to.equal('test4-a');
        expect(result.test3.test5).to.have.lengthOf(2);

        done();
    });
    it('digResponseResult() returns nameResponse.nameResult', (done) => {
        const result = digResponseResult('ListMarketplaceParticipations', listMarketplacesData);
        expect(result).to.be.an('object');
        expect(result).to.have.keys('ListParticipations', 'ListMarketplaces');
        done();
    });
    it('digResponseResult() throws on error', (done) => {
        expect(() => digResponseResult('ListMarketplaceParticipations', errorData)).to.throw();
        done();
    });
});

describe('transformers', () => {
    describe('forceArray', () => {
        const forceArray = transformers.forceArray;
        it('returns empty array for undefined', () => {
            expect(forceArray()).to.be.an('Array').with.lengthOf(0);
        });
        it('returns array with passed parameter inside for non-array values', () => {
            expect(forceArray(0)).to.be.an('Array').with.lengthOf(1);
            expect(forceArray('test')).to.be.an('Array').with.lengthOf(1);
            expect(forceArray({ obj: 'test' })).to.be.an('Array').with.lengthOf(1);
            return true;
        });
        it('returns a copy of array passed in', () => {
            const x = ['test1', 'test2'];
            const y = forceArray(x);
            expect(y).to.not.equal(x);
            expect(y).to.deep.equal(x);
            return true;
        });
    });
    describe('isUpperCase', () => {
        it('returns true for ABCD', () => {
            expect(transformers.isUpperCase('ABCD')).to.be.true;
            return true;
        });
        it('returns false for abcd', () => {
            expect(transformers.isUpperCase('abcd')).to.be.false;
            return true;
        });
        it('returns false for AbCd', () => {
            expect(transformers.isUpperCase('AbCd')).to.be.false;
        });
    });
    describe('camelize', () => {
        it('returns camelCase strings', () => {
            expect(transformers.camelize('PascalCase')).to.equal('pascalCase');
            expect(transformers.camelize('camelCase')).to.equal('camelCase');
            return true;
        });
    });
    describe('subObjUpLevel', () => {
        const test = {
            a: 'b',
            c: {
                d: 0,
                e: 1,
            },
        };
        it('moves a sub-object down a level', () => {
            const x = transformers.subObjUpLevel('c', test);
            const y = transformers.subObjUpLevel.bind(null, 'c', test);
            expect(x).to.be.an('Object').with.all.keys('a', 'd', 'e');
            expect(y).to.not.change(test, 'c');
            return true;
        });
        it('returns a copy of original object when key is not found', () => {
            expect(transformers.subObjUpLevel('junk', test)).to.deep.equal(test);
            return true;
        });
    });
    describe('objToValueSub', () => {
        it('works', () => {
            const test = {
                _: '0.20',
                $: {
                    units: 'inches',
                },
            };
            const x = transformers.objToValueSub(test);
            expect(x).to.deep.equal({
                value: '0.20',
                units: 'inches',
            });
            return true;
        });
    });
    describe('transformKey', () => {
        it('returns camelCase strings', () => {
            expect(transformers.transformKey('PascalCase')).to.equal('pascalCase');
            expect(transformers.transformKey('camelCase')).to.equal('camelCase');
            return true;
        });
        it('returns input when given probable acronym (UPPERCASE)', () => {
            expect(transformers.transformKey('UPPERCASE')).to.equal('UPPERCASE');
            return true;
        });
    });
    describe('transformObjectKeys', () => {
        // TODO: write detailed tests for transformObjectKeys.
        // TODO: should grab actual data from the base API and compare it.
    });
});

describe('isType', () => {
    it('unknown type passes as always valid', (done) => {
        expect(isType('testtype', 'junkdata')).to.be.true;
        done();
    });
    it('xs:int', (done) => {
        expect(isType('xs:int', 0)).to.be.true;
        expect(isType('xs:int', 1)).to.be.true;
        expect(isType('xs:int', 1000)).to.be.true;
        expect(isType('xs:int', -1)).to.be.true;
        expect(isType('xs:int', -1000)).to.be.true;
        expect(() => isType('xs:int', 0.1234)).to.throw();
        expect(isType('xs:int', '1234')).to.be.true;
        expect(() => isType('xs:int', 'coffee')).to.throw();
        expect(() => isType('xs:int', { test: 1 })).to.throw();
        done();
    });
    it('xs:positiveInteger', (done) => {
        expect(() => isType('xs:positiveInteger', -100)).to.throw();
        expect(() => isType('xs:positiveInteger', 0)).to.throw();
        expect(isType('xs:positiveInteger', 100)).to.be.true;
        expect(isType('xs:positiveInteger', 'string')).to.be.false;
        expect(isType('xs:positiveInteger', { test: true })).be.false;
        done();
    });
    it('xs:nonNegativeInteger', (done) => {
        expect(() => isType('xs:nonNegativeInteger', -100)).to.throw();
        expect(isType('xs:nonNegativeInteger', 0)).to.be.true;
        expect(isType('xs:nonNegativeInteger', 100)).to.be.true;
        expect(isType('xs:nonNegativeInteger', 'string')).to.be.false;
        expect(isType('xs:nonNegativeInteger', { test: true })).to.be.false;
        done();
    });
    it('integer ranging', (done) => {
        const range = { minValue: 10, maxValue: 100 };
        expect(() => isType('xs:int', 1, range)).to.throw();
        expect(() => isType('xs:positiveInteger', 1, range)).to.throw();
        expect(() => isType('xs:nonNegativeInteger', 1, range)).to.throw();
        expect(isType('xs:int', 50, range)).to.be.true;
        expect(isType('xs:positiveInteger', 50, range)).to.be.true;
        expect(isType('xs:nonNegativeInteger', 50, range)).to.be.true;
        expect(() => isType('xs:int', 1000, range)).to.throw();
        expect(() => isType('xs:positiveInteger', 1000, range)).to.throw();
        expect(() => isType('xs:nonNegativeInteger', 1000, range)).to.throw();
        done();
    });
    it('xs:string accepts regular strings', (done) => {
        const valid = isType('xs:string', 'this is a regular string');
        expect(valid).to.be.true;
        done();
    });
    it('xs:string accepts string objects', (done) => {
        const valid = isType('xs:string', String('this is a string object'));
        expect(valid).to.be.true;
        done();
    });
    it('xs:string does not accept things that are definitely not strings', (done) => {
        expect(isType('xs:string', { test: true })).to.be.false;
        expect(isType('xs:string', 12345)).to.be.false;
        expect(isType('xs:string', new Date())).to.be.false;
        done();
    });
    it('xs:dateTime fails Date objects (validateAndTransform converts them to ISO)', (done) => {
        expect(isType('xs:dateTime', new Date())).to.be.false;
        done();
    });
    it('xs:dateTime accepts ISO Strings', (done) => {
        expect(isType('xs:dateTime', new Date().toISOString())).to.be.true;
        done();
    });
    it('xs:dateTime fails non-ISO strings', (done) => {
        expect(() => isType('xs:dateTime', 'string')).to.throw(); // Date constructor throws
        expect(isType('xs:dateTime', 12345)).to.be.false;
        expect(() => isType('xs:dateTime', { test: true })).to.throw(); // Date constructor throws
        done();
    });
    it('allowed values works', (done) => {
        const allowed = { values: ['test1', 'test2', 2, 3] };
        expect(isType('xs:string', 'test1', allowed)).to.be.true;
        expect(isType('xs:string', 'test2', allowed)).to.be.true;
        expect(() => isType('xs:string', 'test3', allowed)).to.throw();
        expect(isType('xs:positiveInteger', 2, allowed)).to.be.true;
        expect(isType('xs:nonNegativeInteger', 3, allowed)).to.be.true;
        expect(() => isType('xs:positiveInteger', 100, allowed)).to.throw();
        done();
    });
});

describe('validateAndTransformParameters', () => {
    const req = {
        ReqTest: {
            type: 'xs:string',
            required: true,
        },
        NotReqTest: {
            type: 'xs:string',
            required: false,
        },
    };
    it('called with undefined first arg returns without parsing', (done) => {
        expect(validateAndTransformParameters(undefined, 123)).to.equal(123);
        done();
    });
    it('unknown parameter throws', (done) => {
        expect(() => validateAndTransformParameters(req, { BadTest: 'test' })).to.throw();
        done();
    });
    it('incorrect type throws', (done) => {
        expect(() => validateAndTransformParameters(req, { ReqTest: 123 })).to.throw();
        done();
    });
    describe('required parameters', () => {
        it('required parameter present works', (done) => {
            expect(validateAndTransformParameters(req, { ReqTest: 'test' })).to.deep.equal({ ReqTest: 'test' });
            done();
        });
        it('required parameter not present throws', (done) => {
            expect(() => validateAndTransformParameters(req, { NotReqTest: 'test' })).to.throw();
            done();
        });
    });
    describe('Array to List transformation', () => {
        const listTest = {
            ListTest: {
                type: 'xs:string',
                required: true,
                list: 'Test.List',
                listMax: 2,
            },
        };
        it('throws on non-Arrays', (done) => {
            expect(() => validateAndTransformParameters(listTest, { ListTest: 'oops' })).to.throw();
            done();
        });
        it('throws on incorrect list data types', (done) => {
            expect(() => validateAndTransformParameters(listTest, { ListTest: [123] })).to.throw();
            done();
        });
        it('throws on partial incorrect list data types', (done) => {
            expect(() => validateAndTransformParameters(listTest, { ListTest: ['a', 1] })).to.throw();
            done();
        });
        it('throws on exceeding listMax items', (done) => {
            expect(() => validateAndTransformParameters(listTest, { ListTest: ['1', '2', '3'] })).to.throw();
            done();
        });
        it('outputs correct list parameters (ListTest[x] => Test.List.x+1)', (done) => {
            expect(validateAndTransformParameters(listTest, { ListTest: ['1', '2'] })).to.deep.equal({
                'Test.List.1': '1',
                'Test.List.2': '2',
            });
            done();
        });
    });
});

describe('Validate amazonOrderId format', () => {
    it('validates 3-7-3 amazonOrderId format', (done) => {
        let result = validate('123-1234567-123', { stringFormat: 'amazonOrderId' });
        expect(result).to.be.true;
        result = validate('abc-def-ghi', { stringFormat: 'amazonOrderId' });
        expect(result).to.be.false;
        done();
    });
});

// TODO: a full test configuration for this function to test all possible things could be quite
// extensive, it will take some time/effort.
const generateEndpoints = require('../lib/endpoints/endpoints-utils');

describe('Endpoint Utils', () => {
    it('generateEndpoints', (done) => {
        const endpoints = generateEndpoints(
            'TestCategory',
            '2015-01-01',
            ['TestEndpoint'],
            {
                TestEndpoint: {
                    throttle: {
                        maxInFlight: 1,
                        restoreRate: 1,
                    },
                    params: {
                        TestParam: {
                            type: 'Test',
                            required: true,
                        },
                    },
                    returns: {
                        TestReturn: {
                            type: 'Test',
                            required: true,
                        },
                    },
                },
            },
        );

        expect(endpoints).to.be.an('object');
        expect(endpoints).to.include.all.keys('TestEndpoint');

        const testEndpoint = endpoints.TestEndpoint;
        expect(testEndpoint).to.be.an('object');
        expect(testEndpoint).to.include.all.keys(
            'category', 'version', 'action',
            'params', 'returns',
        );
        expect(testEndpoint.category).to.be.a('string');
        expect(testEndpoint.version).to.be.a('string');
        expect(testEndpoint.action).to.be.a('string');

        const endpointParams = testEndpoint.params;
        expect(endpointParams).to.be.an('object');
        expect(endpointParams).to.include.all.keys('TestParam');
        const testParam = endpointParams.TestParam;
        expect(testParam).to.be.an('object');
        expect(testParam).to.include.all.keys('type', 'required');
        expect(testParam.type).to.be.a('string');
        expect(testParam.required).to.be.a('boolean');

        const endpointReturns = testEndpoint.returns;
        expect(endpointReturns).to.be.an('object');
        expect(endpointReturns).to.include.all.keys('TestReturn');
        const testReturn = endpointReturns.TestReturn;
        expect(testReturn).to.be.an('object');
        expect(testReturn).to.include.all.keys('type', 'required');
        expect(testReturn.type).to.be.a('string');
        expect(testReturn.required).to.be.a('boolean');

        done();
    });
});

const mws = require('..');

let SkipAPITests = false;
let keys;

try {
    keys = require('./keys.json');
} catch (err) {
    keys = {
        accessKeyId: process.env.MWS_ACCESS_KEY,
        secretAccessKey: process.env.MWS_SECRET_ACCESS_KEY,
        merchantId: process.env.MWS_MERCHANT_ID,
    };
}

// TODO: can we set SkipAPITests based on the results of the first API test? if it fails, then we probably need to skip all remaining tests, as something is broken.
if (!keys || !keys.accessKeyId || !keys.secretAccessKey || !keys.merchantId) {
    SkipAPITests = true;
}


describe('mws-advanced sanity', () => {
    // TODO: write tests that test all configuration options individually, and defaults,
    // much like was just written in mws-simple
    // TODO: do we need to write a test that tests authToken if it is present?
    describe('mws.init', () => {
        it('init returns a configured mws object', (done) => {
            const client = mws.init({
                accessKeyId: 'testKeyId',
                secretAccessKey: 'testSecret',
                merchantId: 'testMerchantId',
                authToken: 'authToken',
            });
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
        it('init can pick up environment variables for keys', (done) => {
            const oldkey = process.env.MWS_ACCESS_KEY;
            process.env.MWS_ACCESS_KEY = 'testAccessKey';
            const oldSecret = process.env.MWS_SECRET_ACCESS_KEY;
            process.env.MWS_SECRET_ACCESS_KEY = 'testSecret';
            const oldMerchant = process.env.MWS_MERCHANT_ID;
            process.env.MWS_MERCHANT_ID = 'testMerchant';
            const client = mws.init();
            expect(client.accessKeyId).to.equal('testAccessKey');
            expect(client.secretAccessKey).to.equal('testSecret');
            expect(client.merchantId).to.equal('testMerchant');
            process.env.MWS_ACCESS_KEY = oldkey;
            process.env.MWS_SECRET_ACCESS_KEY = oldSecret;
            process.env.MWS_MERCHANT_ID = oldMerchant;
            done();
        });
        it('init marketplaces', (done) => {
            let client = mws.init({ region: 'CN', marketplace: 'CN' });
            expect(client.host).to.equal('mws.amazonservices.com.cn');
            client = mws.init({ region: 'AU', marketplace: 'AU' });
            expect(client.host).to.equal('mws.amazonservices.com.au');
            client = mws.init({ region: 'JP', marketplace: 'JP' });
            expect(client.host).to.equal('mws.amazonservices.jp');
            client = mws.init({ region: 'IN', marketplace: 'IN' });
            expect(client.host).to.equal('mws.amazonservices.in');
            client = mws.init({ region: 'EU', marketplace: 'DE' });
            expect(client.host).to.equal('mws-eu.amazonservices.com');
            client = mws.init({ region: 'BR', marketplace: 'BR' });
            expect(client.host).to.equal('mws.amazonservices.com');
            client = mws.init({ region: 'NA', marketplace: 'US' });
            expect(client.host).to.equal('mws.amazonservices.com');
            done();
        });
        it('init w/ junk marketplace uses default host', (done) => {
            const client = mws.init({ region: 'TestJunk' });
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
                keys,
                'provide a keys.json file or environment variables with accessKeyId, secretAccessKey, merchantId to test API',
            ).to.include.all.keys(
                'accessKeyId',
                'secretAccessKey',
                'merchantId',
            );
            done();
        });
        it('callEndpoint functions', () => {
            mws.init(keys);
            return expect(mws.callEndpoint(testCall, testParams)).to.be.fulfilled;
        });
        it('callEndpoint saveRaw/saveParsed options', async () => {
            try {
                fs.unlinkSync('./testRaw.json');
                fs.unlinkSync('./testParsed.json');
            } catch (err) {
                //
            }
            mws.init(keys);
            await mws.callEndpoint(testCall, testParams, { noFlatten: true, saveRaw: './testRaw.json', saveParsed: './testParsed.json' });
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
            mws.init(keys);
            const x = await mws.callEndpoint(testCall, testParams, { returnRaw: true });
            expect(x).to.be.an('Object');
            expect(x).to.include.all.keys('GetMatchingProductForIdResponse');
            expect(x.GetMatchingProductForIdResponse).to.include.all.keys('$', 'GetMatchingProductForIdResult', 'ResponseMetadata');
            return true;
        });
        it('callEndpoint noFlatten option', async () => {
            mws.init(keys);
            const x = await mws.callEndpoint(testCall, testParams, { noFlatten: true });
            expect(x).to.be.an('Array');
            expect(x[0]).to.include.all.keys('$', 'Products');
            return true;
        });
        // TODO: be more specific about which Error is being rejected back here, so when there's a code error in callEndpoint, it doesn't phantom pass
        it('callEndpoint throws on unknown endpoint', () => {
            return expect(mws.callEndpoint('/test/endpoint', {})).to.be.rejectedWith(Error);
        });
        it('callEndpoint throws on garbage parameters', () => {
            return expect(mws.callEndpoint('GetOrder', { junkTest: true })).to.be.rejectedWith(Error);
        });
    });
});

describe('API', function runAPITests() {
    let marketIds = [];
    let testMarketId = '';
    let orderIds = [];

    this.timeout(5000);

    beforeEach(function checkSkipAPITests() {
        if (SkipAPITests) {
            this.skip();
        } else {
            mws.init(keys);
        }
    });
    describe('Seller Category', () => {
        it('getMarketplaces', async function testGetMarketplaces() {
            const marketplaceResults = await mws.getMarketplaces();
            expect(marketplaceResults).to.be.an('object');

            marketIds = Object.keys(marketplaceResults);
            expect(marketIds).to.have.lengthOf.above(0);

            testMarketId = marketIds.includes('ATVPDKIKX0DER') ? 'ATVPDKIKX0DER' : marketIds[0];
            const testMarket = marketplaceResults[testMarketId];
            console.warn('* using test markets', marketIds);
            expect(testMarket).to.include.all.keys(
                'marketplaceId', 'defaultCountryCode', 'domainName', 'name',
                'defaultCurrencyCode', 'defaultLanguageCode', 'sellerId',
                'hasSellerSuspendedListings',
            );
            return true;
        });
    });
    describe('Order Category', () => {
        describe('listOrders / listOrderItems / getOrder', () => {
            let orderId;
            it('listOrders', async function testListOrders() {
                if (!marketIds || !marketIds.length) {
                    this.skip();
                    return false;
                }
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                const params = {
                    MarketplaceId: marketIds,
                    CreatedAfter: startDate,
                };
                const results = await mws.listOrders(params);
                expect(results).to.have.lengthOf.above(0);
                orderIds = Object.keys(results).map(order => results[order].AmazonOrderId);
                expect(orderIds).to.have.lengthOf.above(0);
                orderId = orderIds[0];
                return true;
            });
            it('listOrderItems', async () => {
                if (!marketIds || !marketIds.length) {
                    this.skip();
                    return false;
                }
                const results = await mws.listOrderItems(orderId);
                expect(results).to.be.an('Object').and.to.include.all.keys(
                    'orderId',
                    'orderItems',
                );
                return true;
            });
            // TODO: we need to get a wrap on GetOrder!
            it('endpoint GetOrder', async function testGetOrder() {
                if (!orderIds || !orderIds.length) {
                    this.skip();
                    return false;
                }
                const params = {
                    AmazonOrderId: orderIds,
                };
                const results = await mws.callEndpoint('GetOrder', params);

                return results;
            });
        });
    });
    describe('Finances Category', () => {
        it('listFinancialEvents', async function testListFinancialEvents() {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const result = await mws.listFinancialEvents({ PostedAfter: startDate });
            expect(result).to.be.an('object');
            expect(result).to.have.keys(
                'ProductAdsPaymentEventList', 'RentalTransactionEventList',
                'PayWithAmazonEventList', 'ServiceFeeEventList',
                'CouponPaymentEventList', 'ServiceProviderCreditEventList',
                'SellerDealPaymentEventList', 'SellerReviewEnrollmentPaymentEventList',
                'DebtRecoveryEventList', 'ShipmentEventList', 'RetrochargeEventList',
                'SAFETReimbursementEventList', 'GuaranteeClaimEventList', 'ImagingServicesFeeEventList',
                'ChargebackEventList', 'FBALiquidationEventList', 'LoanServicingEventList',
                'RefundEventList', 'AdjustmentEventList', 'PerformanceBondRefundEventList',
            );
            return result;
        });
    });
    describe('FBA Fulfillment Inventory Category', () => {
        it('listInventorySupply', async function testListInventorySupply() {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const result = await mws.listInventorySupply({
                QueryStartDateTime: startDate,
            });
            expect(result).to.be.an('object');
            expect(result).to.contain.keys('supplyList');
            expect(result.supplyList).to.be.an('array');
            return result;
        });
    });
    describe('Products Category', () => {
        describe('getMatchingProductForId', () => {
            // TODO: getMatchingProductForId with two duplicate ASINs throws a 400 Bad Request
            // error, which we may need to investigate special handling for.
            it('getMatchingProductForId single ASIN', async function testGetMatchingProductForId() {
                const result = await mws.getMatchingProductForId({
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU'],
                });
                expect(result).to.be.an('array');
                expect(result).to.have.lengthOf(1);
                expect(result[0]).to.be.an('object');
                expect(result[0].asin).to.equal('B005NK7VTU');
                expect(result[0].idType).to.equal('asin');
                expect(result[0].id).to.equal('B005NK7VTU');
                return result;
            });
            it('getMatchingProductForId 2 ASINs', async function testGetMatchingProductForId2() {
                const result = await mws.getMatchingProductForId({
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU', 'B00OB8EYZE'],
                });
                expect(result).to.be.an('array');
                expect(result).to.have.lengthOf(2);
                return result;
            });
            it('getMatchingProductForId single UPC', async function testGetMatchingProductForId3() {
                const result = await mws.getMatchingProductForId({
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'UPC',
                    IdList: ['020357122682'],
                });
                expect(result).to.be.an('array');
                expect(result).to.have.lengthOf(1);
                expect(result[0]).to.be.an('object');
                expect(result[0].upc).to.equal('020357122682');
                expect(result[0].idType).to.equal('upc');
                expect(result[0].id).to.equal('020357122682');
                return result;
            });
            // TODO: get more specific about what type of Error we expect - code errors cause success
            it('getMatchingProductForId with invalid UPC', function testGetMatchingProductForId4() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'UPC',
                    IdList: ['012345678900'],
                };
                // Error: {"Type":"Sender","Code":"InvalidParameterValue","Message":"Invalid UPC identifier 000000000000 for marketplace ATVPDKIKX0DER"}
                return expect(mws.getMatchingProductForId(params)).to.be.rejectedWith(Error);
            });
            // TODO: get more specific about what type of Error
            it('getMatchingProductForId with ASIN that has been deleted', async function testGetMatchingProductForId5() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B01FZRFN2C'],
                };
                return expect(mws.getMatchingProductForId(params)).to.be.rejectedWith(Error);
            });
            // TODO: be more specific about what type of Error
            // oddly, the Amazon API throws Error 400 from the server if you give it duplicate items, instead of ignoring dupes or throwing individual errors, or returning multiple copies.
            it('getMatchingProductForId with duplicate ASINs in list', async function testGetMatchingProductForId6() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU', 'B00OB8EYZE', 'B005NK7VTU', 'B00OB8EYZE'],
                };
                return expect(mws.getMatchingProductForId(params)).to.be.rejectedWith(Error);
            });
            it('getMatchingProductForId with partial error (1 asin that works, 1 that doesnt)', async function testGetMatchingProductForId7() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU', 'B01FZRFN2C'],
                };
                const result = await mws.getMatchingProductForId(params);
                expect(result).to.be.an('array');
                expect(result[0]).to.be.an('object');
                expect(result[0].asin).to.equal('B005NK7VTU');
                expect(result[1]).to.be.an('object');
                expect(result[1].asin).to.equal('B01FZRFN2C');
                expect(result[1].Error).to.be.an('object');
                return true;
            });
        });
        it('getLowestPricedOffers', async function testGetLowestPricedOffersForASIN() {
            const params = {
                MarketplaceId: 'ATVPDKIKX0DER',
                ASIN: 'B010YSIKKY',
                ItemCondition: 'New',
            };
            const result = await mws.getLowestPricedOffersForASIN(params);
            expect(result).to.be.an('object').with.keys(
                'asin',
                'marketplace',
                'itemCondition',
                'summary',
                'lowestOffers',
            );
            const summary = result.summary;
            expect(summary).to.be.an('object').with.keys(
                'totalOfferCount',
                'numberOfOffers',
                'lowestPrices',
                'buyBoxPrices',
                'buyBoxEligibleOffers',
                'listPrice',
            );
            expect(summary.totalOfferCount).to.be.a('number');
            expect(summary.numberOfOffers).to.be.an('array');
            expect(summary.lowestPrices).to.be.an('array');
            expect(summary.buyBoxPrices).to.be.an('array');
            expect(summary.buyBoxEligibleOffers).to.be.an('array');

            expect(result.lowestOffers).to.be.an('array');
            return result;
        });
    });
    describe('Reports Category', () => {
        let reportList = [];
        let ReportRequestId = null;
        it('requestReport', async function () {
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests (set env REPORTS_TESTS=true to perform)');
                this.skip();
                return false;
            }
            const report = await mws.requestReport({
                ReportType: '_GET_V1_SELLER_PERFORMANCE_REPORT_',
            });
            expect(report).to.be.an('object').with.keys(
                'ReportType',
                'ReportProcessingStatus',
                'EndDate',
                'Scheduled',
                'ReportRequestId',
                'SubmittedDate',
                'StartDate',
            );
            ({ ReportRequestId } = report);
            console.warn('* setting future report request id to', ReportRequestId);
            return true;
        });
        it('getReportRequestList (timeout disabled, retries until status shows a done or cancelled state)', async function testGetReportRequestList() {
            if (!ReportRequestId) {
                this.skip();
                return false;
            }
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests');
                this.skip();
                return false;
            }
            this.timeout(0);
            let reportComplete = false;
            let list;
            while (!reportComplete) {
                // eslint-disable-next-line no-await-in-loop
                list = await mws.getReportRequestList({
                    ReportRequestIdList: [ReportRequestId],
                });
                const status = list.ReportProcessingStatus;
                if (status !== '_SUBMITTED_' && status !== '_IN_PROGRESS_') {
                    reportComplete = true;
                } else {
                    // eslint-disable-next-line no-await-in-loop
                    await sleep(30000);
                }
            }
            return true;
        });
        it('getReportListAll', async function testGetReportListAll() {
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests');
                this.skip();
                return false;
            }
            reportList = await mws.getReportListAll({
                ReportTypeList: ['_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_'],
            });
            expect(reportList).to.be.an('array');
            expect(reportList).to.have.lengthOf.above(0);
            return reportList;
        });
        it('getReport', async function testGetReport() {
            if (!reportList || !reportList.length) {
                this.skip();
                return false;
            }
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests');
                this.skip();
                return false;
            }

            const report = await mws.getReport({
                ReportId: reportList[0].ReportId,
            });
            fs.writeFileSync('settlement.json', JSON.stringify(report, null, 4));
            expect(report).to.be.an('array');
            expect(report).to.have.lengthOf.above(0);
            const settlement = report[0];
            expect(settlement).to.include.all.keys(
                'settlement-id', 'settlement-start-date', 'settlement-end-date',
                'deposit-date', 'total-amount', 'currency',
            );
            const amount = parseFloat(settlement['total-amount']);
            expect(amount).to.be.a('number');
            console.warn(`* Found settlement of ${amount}`);
            return settlement;
        });
        it('requestAndDownloadReport (timeout 120sec)', async function testRequestDownloadReport() {
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests');
                this.skip();
                return false;
            }
            this.timeout(120 * 1000);
            await mws.requestAndDownloadReport('_GET_FLAT_FILE_OPEN_LISTINGS_DATA_', './test-listings.json');
            expect(fs.existsSync('./test-listings.json')).to.equal(true);
            try {
                fs.unlinkSync('./test-listings.json');
            } catch (err) {
                //
            }
            return true;
        });
    });
});
