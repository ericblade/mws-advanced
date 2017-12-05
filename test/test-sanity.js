// no-extraneous-dependencies would force us to put chai as a non-dev dep
// no-undef breaks the standard pattern with chai, apparently
// no-unused-expressions also breaks standard chai patterns
// remove prefer-destructuring here because for some reason eslint is failing to handle it with require()
// remove prefer-arrow-function because we need to use regular functions in places to access this.skip()

/* eslint-disable import/no-extraneous-dependencies,no-undef,no-unused-expressions,prefer-destructuring,prefer-arrow-callback */
const fs = require('fs'); // yes i know i probably shouldn't be writing files in tests. sorry.

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const sleep = require('../lib/sleep');
const isType = require('../lib/validation.js').isType;
const flattenResult = require('../lib/flatten-result').flattenResult;
const { digResponseResult } = require('../lib/dig-response-result');

const listMarketplacesData = require('./ListMarketplaces.json');
const errorData = require('./errorData.json');

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

describe('isType', () => {
    it('unknown type passes as always valid', (done) => {
        expect(isType('testtype', 'junkdata')).to.be.true;
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
        expect(() => isType('xs:positiveInteger', 1, range)).to.throw();
        expect(() => isType('xs:nonNegativeInteger', 1, range)).to.throw();
        expect(isType('xs:positiveInteger', 50, range)).to.be.true;
        expect(isType('xs:nonNegativeInteger', 50, range)).to.be.true;
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
const keys = require('./keys.json');

// TODO: can we set SkipAPITests based on the results of the first API test? if it fails, then we probably need to skip all remaining tests, as something is broken.
let SkipAPITests = false;
if (!keys || !keys.accessKeyId || !keys.secretAccessKey || !keys.merchantId) {
    SkipAPITests = true;
}

describe('mws-advanced sanity', () => {
    // TODO: write tests that test all configuration options individually, and defaults,
    // much like was just written in mws-simple
    // TODO: do we need to write a test that tests authToken if it is present?
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
    it('tester provided a likely correct keys.json file', (done) => {
        expect(
            keys,
            'provide a keys.json file with accessKeyId, secretAccessKey, merchantId to test API',
        ).to.include.all.keys(
            'accessKeyId',
            'secretAccessKey',
            'merchantId',
        );
        done();
    });
    it('callEndpoint throws on unknown endpoint', async () => {
        expect(mws.callEndpoint('/test/endpoint', {})).to.be.rejectedWith(Error);
    });
    it('callEndpoint throws on garbage parameters', async () => {
        expect(mws.callEndpoint('GetOrder', { junkTest: true })).to.be.rejectedWith(Error);
    });
    it('callEndpoint functions', async () => {
        mws.init(keys);
        expect(mws.callEndpoint('ListMarketplaceParticipations', {})).to.be.fulfilled;
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
            expect(marketplaceResults).to.include.all.keys(
                'marketDetails',
                'marketParticipations',
                'markets',
            );
            expect(marketplaceResults.marketDetails).to.be.an('object');
            expect(marketplaceResults.marketParticipations).to.be.an('array');
            expect(marketplaceResults.marketParticipations).to.have.lengthOf.above(0);
            expect(marketplaceResults.markets).to.be.an('array');
            expect(marketplaceResults.markets).to.have.lengthOf.above(0);

            marketIds = Object.keys(marketplaceResults.marketDetails);
            expect(marketIds).to.have.lengthOf.above(0);
            testMarketId = marketIds.includes('ATVPDKIKX0DER') ? 'ATVPDKIKX0DER' : marketIds[0];
            const testMarket = marketplaceResults.marketDetails[testMarketId];
            console.warn('* using test markets', marketIds);
            expect(testMarket).to.include.all.keys(
                'MarketplaceId', 'DefaultCountryCode', 'DomainName', 'Name',
                'DefaultCurrencyCode', 'DefaultLanguageCode', 'SellerId',
                'HasSellerSuspendedListings',
            );
            return true;
        });
    });
    describe('Order Category', () => {
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
            return true;
        });
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
    describe('Reports Category', () => {
        let reportList = [];
        it('getReportListAll', async function testGetReportListAll() {
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
                'SAFETReimbursementEventList', 'GuaranteeClaimEventList',
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
        it('getMatchingProductForId single ASIN', async function testGetMatchingProductForId() {
            const result = await mws.getMatchingProductForId({
                MarketplaceId: 'ATVPDKIKX0DER',
                IdType: 'ASIN',
                IdList: ['B005NK7VTU'],
            });
            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(1);
            expect(result[0]).to.be.an('object');
            expect(result[0]).to.have.key('B005NK7VTU');
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
            expect(result[0]).to.have.key('020357122682');
            return result;
        });
        it('getMatchingProductForId with invalid UPC', async function testGetMatchingProductForId4() {
            const params = {
                MarketplaceId: 'ATVPDKIKX0DER',
                IdType: 'UPC',
                IdList: ['012345678900'],
            };
            // Error: {"Type":"Sender","Code":"InvalidParameterValue","Message":"Invalid UPC identifier 000000000000 for marketplace ATVPDKIKX0DER"}
            expect(mws.getMatchingProductForId(params)).to.be.rejectedWith(Error);
            return true;
        });
    });
});
