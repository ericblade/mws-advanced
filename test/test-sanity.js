// no-extraneous-dependencies would force us to put chai as a non-dev dep
// no-undef breaks the standard pattern with chai, apparently

/* eslint-disable import/no-extraneous-dependencies,no-undef */
const fs = require('fs'); // yes i know i probably shouldn't be writing files in tests. sorry.

// eslint-disable-next-line prefer-destructuring
const expect = require('chai').expect;

describe('Sanity', () => {
    it('true is true', (done) => {
        expect(true).to.equal(true);
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
