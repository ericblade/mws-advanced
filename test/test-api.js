const fs = require('fs');

const MWS = require('..');
const errors = require('../lib/errors');
const sleep = require('../lib/util/sleep');

describe('API', function runAPITests() {
    let marketIds = ['ATVPDKIKX0DER'];
    let testMarketId = 'ATVPDKIKX0DER';
    let orderIds = [];

    this.timeout(10000);

    beforeEach(function checkSkipAPITests() {
        if (SkipAPITests) {
            this.skip();
        } else {
            MWS.init(MWSAPIKeys);
        }
    });
    describe('Seller Category', () => {
        it('getMarketplaces', async function testGetMarketplaces() {
            const marketplaceResults = await MWS.getMarketplaces();
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
                const results = await MWS.listOrders(params);
                expect(results).to.have.lengthOf.above(0);
                orderIds = Object.keys(results).map((order) => results[order].AmazonOrderId);
                expect(orderIds).to.have.lengthOf.above(0);
                orderId = orderIds[0];
                return true;
            });
            it('listOrderItems', async function testListOrderItems() {
                if (!marketIds || !marketIds.length) {
                    this.skip();
                    return false;
                }
                const results = await MWS.listOrderItems(orderId);
                return expect(results).to.be.an('Object').and.to.include.all.keys(
                    'orderId',
                    'orderItems',
                );
            });
            it('endpoint GetOrder', async function testGetOrder() {
                if (!orderIds || !orderIds.length) {
                    this.skip();
                    return false;
                }
                const cappedOrderIdsLength = orderIds.length >= 50 ? orderIds.slice(0, 49) : orderIds;
                const results = await MWS.getOrder({ AmazonOrderId: cappedOrderIdsLength });
                expect(results).to.be.an('array');
                expect(results).to.have.lengthOf.above(0);
                return results;
            });
        });
    });
    describe('Finances Category', () => {
        it('listFinancialEvents', async function testListFinancialEvents() {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const result = await MWS.listFinancialEvents({ PostedAfter: startDate });
            expect(result).to.be.an('object');
            expect(result).to.include.keys(
                'ProductAdsPaymentEventList', 'RentalTransactionEventList',
                'PayWithAmazonEventList', 'ServiceFeeEventList',
                'CouponPaymentEventList', 'ServiceProviderCreditEventList',
                'SellerDealPaymentEventList', 'SellerReviewEnrollmentPaymentEventList',
                'DebtRecoveryEventList', 'ShipmentEventList', 'RetrochargeEventList',
                'SAFETReimbursementEventList', 'GuaranteeClaimEventList', 'ImagingServicesFeeEventList',
                'ChargebackEventList', 'FBALiquidationEventList', 'LoanServicingEventList',
                'RefundEventList', 'AdjustmentEventList', 'PerformanceBondRefundEventList',
                'AffordabilityExpenseEventList', 'AffordabilityExpenseReversalEventList',
                'NetworkComminglingTransactionEventList',
            );
            // another possible key is RemovalShipmentEventList, but only comes up if you have
            // removal orders in your recent queue
            return result;
        });
    });
    describe('FBA Fulfillment Inventory Category', () => {
        it('listInventorySupply', async function testListInventorySupply() {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const result = await MWS.listInventorySupply({
                QueryStartDateTime: startDate,
            });
            expect(result).to.be.an('object');
            expect(result).to.contain.keys('supplyList');
            expect(result.supplyList).to.be.an('array');
            return result;
        });
    });
    describe('Products Category', () => {
        describe('listMatchingProducts', () => {
            it('listMatchingProducts better made special potato sticks original', async function testListMatchingProducts() {
                const results = await MWS.listMatchingProducts({
                    marketplaceId: 'ATVPDKIKX0DER',
                    query: 'better made special potato sticks original',
                });
                expect(results).to.be.an('array');
                expect(results).to.have.length.greaterThan(0);
                const test = results[0];
                expect(test).to.be.an('object').that.contains.keys(
                    'identifiers',
                    'attributeSets',
                    'relationships',
                    'salesRankings',
                );
            });
            it('listMatchingProducts testjunk (expect empty response here)', async function testListMatchingProducts2() {
                const results = await MWS.listMatchingProducts({
                    marketplaceId: 'ATVPDKIKX0DER',
                    query: 'testjunk',
                });
                return expect(results).to.be.an('array').with.lengthOf(0);
            });
        });
        describe('getMatchingProductForId', () => {
            // TODO: getMatchingProductForId with two duplicate ASINs throws a 400 Bad Request
            // error, which we may need to investigate special handling for.
            it('getMatchingProductForId single ASIN', async function testGetMatchingProductForId() {
                const result = await MWS.getMatchingProductForId({
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
                const result = await MWS.getMatchingProductForId({
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU', 'B00OB8EYZE'],
                });
                expect(result).to.be.an('array');
                expect(result).to.have.lengthOf(2);
                return result;
            });
            it('getMatchingProductForId single UPC', async function testGetMatchingProductForId3() {
                const result = await MWS.getMatchingProductForId({
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
            it('getMatchingProductForId with invalid UPC', function testGetMatchingProductForId4() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'UPC',
                    IdList: ['012345678900'],
                };
                // Error: {"Type":"Sender","Code":"InvalidParameterValue","Message":"Invalid UPC identifier 000000000000 for marketplace ATVPDKIKX0DER"}
                return expect(MWS.getMatchingProductForId(params)).to.be.rejectedWith(errors.ServiceError);
            });
            it('getMatchingProductForId with ASIN that has been deleted', async function testGetMatchingProductForId5() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B01FZRFN2C'],
                };
                return expect(MWS.getMatchingProductForId(params)).to.be.rejectedWith(errors.ServiceError);
            });
            // oddly, the Amazon API throws Error 400 from the server if you give it duplicate items, instead of ignoring dupes or throwing individual errors, or returning multiple copies.
            it('getMatchingProductForId with duplicate ASINs in list', async function testGetMatchingProductForId6() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU', 'B00OB8EYZE', 'B005NK7VTU', 'B00OB8EYZE'],
                };
                const p = await MWS.getMatchingProductForId(params);
                return expect(p).to.be.an('array').with.lengthOf(2);
                // at some point MWS decided this was no longer an error condition, and they would
                // just return the results for the items sans duplicates.
                // return expect(p).to.eventually.be.rejectedWith(mws.ServiceError);
            });
            it('getMatchingProductForId with partial error (1 asin that works, 1 that doesnt)', async function testGetMatchingProductForId7() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU', 'B01FZRFN2C'],
                };
                const result = await MWS.getMatchingProductForId(params);
                expect(result).to.be.an('array');
                expect(result[0]).to.be.an('object');
                expect(result[0].asin).to.equal('B005NK7VTU');
                expect(result[1]).to.be.an('object');
                expect(result[1].asin).to.equal('B01FZRFN2C');
                expect(result[1].Error).to.be.an('object');
                return true;
            });
        });
        describe('getLowestPricedOffers', () => {
            it('getLowestPricedOffersForSku', function () {
                // console.warn('* test for getLowestPricedOffersForSKU not yet implemented, requires fetching a valid SellerSKU');
                this.skip();
                return false;
            });
            it('getLowestPricedOffersForAsin', async function testGetLowestPricedOffersForASIN() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    ASIN: 'B010YSIKKY',
                    ItemCondition: 'New',
                };
                const result = await MWS.getLowestPricedOffersForAsin(params);
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
        describe('getProductCategories*', () => {
            it('getProductCategoriesForAsins returns single result', async function testCategoriesAsins() {
                const result = await MWS.getProductCategoriesForAsins({
                    marketplaceId: 'ATVPDKIKX0DER',
                    asins: ['B00IDD9TU8'],
                });
                expect(result).to.be.an('Array').with.lengthOf(1);
                expect(result[0]).to.include.all.keys('asin', 'Self');
                expect(result[0].asin).to.equal('B00IDD9TU8');
            });
            it('getProductCategoriesForAsins returns multiple results', async function testCategoriesAsins2() {
                const result = await MWS.getProductCategoriesForAsins({
                    marketplaceId: 'ATVPDKIKX0DER',
                    asins: ['B00IDD9TU8', 'B00IH00CN0'],
                });
                expect(result).to.be.an('Array').with.lengthOf(2);
                expect(result[0]).to.include.all.keys('asin', 'Self');
                expect(result[0].asin).to.equal('B00IDD9TU8');
                expect(result[1]).to.include.all.keys('asin', 'Self');
                expect(result[1].asin).to.equal('B00IH00CN0');
            });
            // TODO: figure out some function we can use to query some valid skus to use
            // TODO: we should test error conditions for getProductCategories*, however, throwing up
            // invalid ASINs comes up with potentially several different results:
            // 1- no category returned, no error
            // 2- error 400, "invalid ASIN for marketplace (x)",
            // 3- error 500, "Server Error"
            it.skip('getProductCategoriesForSkus', 'unable to test skus without first querying skus');
        });
        describe('getMyFeesEstimate', () => {
            const test1 = {
                marketplaceId: 'ATVPDKIKX0DER',
                idType: 'ASIN',
                idValue: 'B002KT3XQM',
                isAmazonFulfilled: true,
                identifier: '1',
                listingPrice: {
                    currencyCode: 'USD',
                    amount: '0.00',
                },
                shipping: {
                    currencyCode: 'USD',
                    amount: '0.00',
                },
            };
            const test2 = {
                ...test1,
                identifier: '2',
                idValue: 'B0774JLFLW',
                isAmazonFulfilled: false,
            };
            // TODO: should build a test for deleted/invalid B00IDD9TU8 to ensure bad items come back in an expected fashion

            // TODO: write tests for potential failure conditions, make sure code handles them as expected
            // TODO: write a function to compare (input [test1/test2] and output [testRes, testRes2]) so that code isn't so needlessly duplicated
            it('getMyFeesEstimate returns object indexed by request Identifier', async function testFeesSingle() {
                const result = await MWS.getMyFeesEstimate([test1]);
                expect(result).to.be.an('Object').that.includes.all.keys(test1.identifier);
                const testRes = result[test1.identifier];
                expect(testRes).to.be.an('Object').that.includes.all.keys('totalFees', 'time', 'detail', 'identifier', 'status');
                expect(testRes.totalFees).to.be.an('Object').that.includes.all.keys('currencyCode', 'amount');
                expect(testRes.time).to.be.a('string');
                expect(testRes.detail).to.be.an('Array');
                expect(testRes.identifier).to.be.an('Object').that.includes.all.keys('marketplaceId', 'idType', 'sellerId', 'isAmazonFulfilled', 'sellerInputIdentifier', 'idValue', 'priceToEstimateFees');
                expect(testRes.status).to.equal('Success');
                const testId = testRes.identifier;
                expect(testId.marketplaceId).to.equal(test1.marketplaceId);
                expect(testId.idType).to.equal(test1.idType);
                expect(testId.sellerId).to.be.a('string');
                expect(testId.isAmazonFulfilled).to.equal(test1.isAmazonFulfilled);
                expect(testId.sellerInputIdentifier).to.equal(test1.identifier);
                expect(testId.idValue).to.equal(test1.idValue);
                const prices = testId.priceToEstimateFees;
                expect(prices.listingPrice).to.deep.equal(test1.listingPrice);
                expect(prices.shipping).to.deep.equal(test1.shipping);
            });
            it('getMyFeesEstimate returns correctly for multiple items', async function testFeesMultiple() {
                const result = await MWS.getMyFeesEstimate([test1, test2]);
                expect(result).to.be.an('Object').that.includes.all.keys(test1.identifier, test2.identifier);
                const testRes = result[test1.identifier];
                expect(testRes).to.be.an('Object').that.includes.all.keys('totalFees', 'time', 'detail', 'identifier', 'status');
                expect(testRes.totalFees).to.be.an('Object').that.includes.all.keys('currencyCode', 'amount');
                expect(testRes.time).to.be.a('string');
                expect(testRes.detail).to.be.an('Array');
                expect(testRes.identifier).to.be.an('Object').that.includes.all.keys('marketplaceId', 'idType', 'sellerId', 'isAmazonFulfilled', 'sellerInputIdentifier', 'idValue', 'priceToEstimateFees');
                expect(testRes.status).to.equal('Success');
                const testId = testRes.identifier;
                expect(testId.marketplaceId).to.equal(test1.marketplaceId);
                expect(testId.idType).to.equal(test1.idType);
                expect(testId.sellerId).to.be.a('string');
                expect(testId.isAmazonFulfilled).to.equal(test1.isAmazonFulfilled);
                expect(testId.sellerInputIdentifier).to.equal(test1.identifier);
                expect(testId.idValue).to.equal(test1.idValue);
                const prices = testId.priceToEstimateFees;
                expect(prices.listingPrice).to.deep.equal(test1.listingPrice);
                expect(prices.shipping).to.deep.equal(test1.shipping);

                const testRes2 = result[test2.identifier];
                expect(testRes2).to.be.an('Object').that.includes.all.keys('totalFees', 'time', 'detail', 'identifier', 'status');
                expect(testRes2.totalFees).to.be.an('Object').that.includes.all.keys('currencyCode', 'amount');
                expect(testRes2.time).to.be.a('string');
                expect(testRes2.detail).to.be.an('Array');
                expect(testRes2.identifier).to.be.an('Object').that.includes.all.keys('marketplaceId', 'idType', 'sellerId', 'isAmazonFulfilled', 'sellerInputIdentifier', 'idValue', 'priceToEstimateFees');
                expect(testRes2.status).to.equal('Success');
                const testId2 = testRes2.identifier;
                expect(testId2.marketplaceId).to.equal(test2.marketplaceId);
                expect(testId2.idType).to.equal(test2.idType);
                expect(testId2.sellerId).to.be.a('string');
                expect(testId2.isAmazonFulfilled).to.equal(test2.isAmazonFulfilled);
                expect(testId2.sellerInputIdentifier).to.equal(test2.identifier);
                expect(testId2.idValue).to.equal(test2.idValue);
                const prices2 = testId2.priceToEstimateFees;
                expect(prices2.listingPrice).to.deep.equal(test2.listingPrice);
                expect(prices2.shipping).to.deep.equal(test2.shipping);
            });
            // TODO: this test used to test for a ServerError condition, where data was not
            // available.
            // now the exact same call is providing a ClientError instead. ?!
            it('getMyFeesEstimate error handling', async function testFeesErrors() {
                const feeTest = {
                    marketplaceId: 'ATVPDKIKX0DER',
                    idType: 'ASIN',
                    idValue: 'B0002APO1I',
                    isAmazonFulfilled: true,
                    listingPrice: {
                        currencyCode: 'USD',
                        amount: '0.00',
                    },
                    shipping: {
                        currencyCode: 'USD',
                        amount: '0.00',
                    },
                };
                const res = await MWS.getMyFeesEstimate([feeTest]);
                const test = res[`FBA.${feeTest.idValue}`];
                // console.warn('* res=', res);
                expect(test.totalFees).to.equal(undefined);
                expect(test.time).to.equal(undefined);
                expect(test.detail).to.equal(undefined);
                expect(test.identifier).to.be.an('Object');
                expect(test.identifier.isAmazonFulfilled).to.equal(true);
                // expect(test.status).to.equal('ServerError');
                expect(test.status).to.equal('ClientError');
                expect(test.error).to.be.an('Object').that.includes.all.keys('code', 'message', 'type');
                // expect(test.error.code).to.equal('DataNotAvailable');
                expect(test.error.code).to.equal('InvalidParameterValue');
                // expect(test.error.message).to.equal('Item shipping weight is not available.');
                expect(test.error.message).to.equal('There is an client-side error. Please verify your inputs.');
                expect(test.error.type).to.equal('Sender');
                // expect(test.error.type).to.equal('Receiver');
                return res;
            });
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
            const report = await MWS.requestReport({
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
                list = await MWS.getReportRequestList({
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
            reportList = await MWS.getReportListAll({
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

            const report = await MWS.getReport({
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
            await MWS.requestAndDownloadReport('_GET_FLAT_FILE_OPEN_LISTINGS_DATA_', './test-listings.json');
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
