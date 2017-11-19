// no-extraneous-dependencies would force us to put chai as a non-dev dep
// no-undef breaks the standard pattern with chai, apparently
// no-unused-expressions also breaks standard chai patterns
// remove prefer-destructuring here because for some reason eslint is failing to handle it with require()

/* eslint-disable import/no-extraneous-dependencies,no-undef,no-unused-expressions,prefer-destructuring */
const fs = require('fs'); // yes i know i probably shouldn't be writing files in tests. sorry.

// eslint-disable-next-line prefer-destructuring
const expect = require('chai').expect;

const sleep = require('../lib/sleep');
const isType = require('../lib/validation.js').isType;

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
});

describe('isType', () => {
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

describe('mws-advanced sanity', () => {
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
});

describe('API', () => {
    let marketIds = [];
    let testMarketId = '';
    let orderIds = [];

    before(() => {
        mws.init(keys);
    });
    describe('Seller Category', () => {
        it('getMarketplaces', async () => {
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
        it('listOrders', async () => {
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
        it('endpoint GetOrder', async () => {
            const params = {
                AmazonOrderId: orderIds,
            };
            const results = await mws.callEndpoint('GetOrder', params);

            return results;
        });
    });
    describe('Reports Category', () => {
        let reportList = [];
        it('getReportListAll', async () => {
            reportList = await mws.getReportListAll({
                ReportTypeList: ['_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_'],
            });
            expect(reportList).to.be.an('array');
            expect(reportList).to.have.lengthOf.above(0);
            return reportList;
        });
        it('getReport', async () => {
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
});
