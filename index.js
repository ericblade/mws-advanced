const { init, callEndpoint } = require('./lib');
const { sleep } = require('./lib/sleep');
const { promisify } = require('util');
const fs = require('fs');

const writeFile = promisify(fs.writeFile);

// return data['{name}Response']['{name}Result'] as most APIs seem to return from the hierarchy
// before any of the useful data is buried.
const digResponseResult = (name, data) => {
    try {
        return data[`${name}Response`][`${name}Result`];
    } catch (err) {
        return data;
    }
};

/*
    returns:
    { markets, marketParticipations, marketDetails }
    markets = MarketplaceId, DefaultCountryCode, DomainName, Name, DefaultCurrencyCode, DefaultLanguageCode
    marketParticipations = MarketplaceId, SellerId, HasSellerSuspendedListings
    marketDetails = {
        marketplaceID: {
            ... all of the above
        }
    }
*/

// TODO: upgrade to call ListMarketplaceParticipationsByNextToken when a NextToken
// response is returned.
// FURTHER TODO: how smart can we make our framework? can we handle multiple requests
// to any endpoint that returns a NextToken ?
// EVEN FURTHER TODO: can we handle rate limiting, while we're doing that, and only
// return results when we get all the data?

const getMarketplaces = async () => {
    const result = await callEndpoint('ListMarketplaceParticipations');
    const result2 = digResponseResult('ListMarketplaceParticipations', result);

    // destructure result2.ListParticipations.Participation to marketParticipationsTemp
    const { ListParticipations: { Participation: marketParticipationsTemp } } = result2;
    // destructure result2.ListMarketplaces.Marketplace to marketsTemp
    const { ListMarketplaces: { Marketplace: marketsTemp } } = result2;

    const marketDetails = {};

    // map and filter
    const markets = marketsTemp.reduce((arr, market) => {
        // market = { MarketplaceId, DefaultCountryCode, DomainName, DefaultCurrencyCode, Name }
        // A2ZV50J4W1RKNI === "sim1.stores.amazon.com", "Non-Amazon"
        // A1MQXOICRS2Z7M === "siprod.stores.amazon.ca", "SI CA Prod Marketplace"
        // A2EUQ1WTGCTBG2 === "www.amazon.ca" "Amazon.ca"
        // ATVPDKIKX0DER === "www.amazon.com" "Amazon.com"
        // Looks like "Non-Amazon" and "SI CA Prod Marketplace" are test markets? maybe?
        if (market.MarketplaceId === 'A2ZV50J4W1RKNI' || market.MarketplaceId === 'A1MQXOICRS2Z7M') {
            return arr;
        }
        arr.push(market);
        marketDetails[market.MarketplaceId] = market;
        return arr;
    }, []);

    // marketParticipation = { MarketplaceId, SellerId, HasSellerSuspendedListings }
    // map and filter
    const marketParticipations = marketParticipationsTemp.reduce((arr, participation) => {
        if (participation.MarketplaceId === 'A2ZV50J4W1RKNI' || participation.MarketplaceId === 'A1MQXOICRS2Z7M') {
            return arr;
        }
        arr.push(participation);
        marketDetails[participation.MarketplaceId] = {
            ...marketDetails[participation.MarketplaceId],
            ...participation,
        };
        return arr;
    }, []);

    return { markets, marketParticipations, marketDetails };
};

// see https://docs.developer.amazonservices.com/en_UK/orders-2013-09-01/Orders_ListOrders.html
// returns
/*
    LatestShipDate: [Array], OrderType: [Array], PurchaseDate: [Array], AmazonOrderId: [Array],
    BuyerEmail: [Array], LastUpdateDate: [Array], IsReplacementOrder: [Array], ShipServiceLevel: [Array],
    NumberOfItemsShipped: [Array], OrderStatus: [Array], SalesChannel: [Array], ShippedByAmazonTFM: [Array],
    IsBusinessOrder: [Array], LatestDeliveryDate: [Array], NumberOfItemsUnshipped: [Array],
    PaymentMethodDetails: [Array], BuyerName: [Array], EarliestDeliveryDate: [Array],
    OrderTotal: [Array], IsPremiumOrder: [Array], EarliestShipDate: [Array], MarketplaceId: [Array],
    FulfillmentChannel: [Array], PaymentMethod: [Array], ShippingAddress: [Array],
    IsPrime: [Array], ShipmentServiceLevelCategory: [Array]
*/
// TODO: if provide a NextToken then call ListOrdersByNextToken ?
// TODO: provide an option to automatically call ListOrdersByNextToken if NextToken is received?
const listOrders = async (options) => {
    const results = await callEndpoint('ListOrders', options);
    const orders = digResponseResult('ListOrders', results);
    return orders.Orders.Order;
};

/*
  // http://docs.developer.amazonservices.com/en_US/finances/Finances_Datatypes.html#FinancialEvents
  ProductAdsPaymentEventList: '',
  RentalTransactionEventList: '',
  PayWithAmazonEventList: '',
  ServiceFeeEventList: { ServiceFeeEvent: [ [Object], [Object] ] },
  ServiceProviderCreditEventList: '',
  SellerDealPaymentEventList: '',
  SellerReviewEnrollmentPaymentEventList: '',
  DebtRecoveryEventList: '',
  ShipmentEventList: { ShipmentEvent: [ [Object], [Object], [Object], [Object] ] },
  RetrochargeEventList: '',
  SAFETReimbursementEventList: '',
  GuaranteeClaimEventList: '',
  ChargebackEventList: '',
  FBALiquidationEventList: '',
  LoanServicingEventList: '',
  RefundEventList: '',
  AdjustmentEventList:
   { AdjustmentEvent:
      [ [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object] ] },
  PerformanceBondRefundEventList: ''
*/
const listFinancialEvents = async (options) => {
    const results = await callEndpoint('ListFinancialEvents', options);
    const financialEvents = digResponseResult('ListFinancialEvents', results);
    return financialEvents;
};

/*
[ { Condition: 'NewItem',
    SupplyDetail: '',
    TotalSupplyQuantity: '0',
    FNSKU: 'B000WFVXGI',
    InStockSupplyQuantity: '0',
    ASIN: 'B000WFVXGI',
    SellerSKU: 'ND-X5EF-Z0N1' } ]
*/
const listInventorySupply = async (options) => {
    const results = await callEndpoint('ListInventorySupply', options);
    const inventorySupply = digResponseResult('ListInventorySupply', results);
    return inventorySupply.InventorySupplyList.member;
};

/*
returns
[ { Identifiers: { MarketplaceASIN: [Object] },
    AttributeSets: { 'ns2:ItemAttributes': [Object] },
    Relationships: '',
    SalesRankings: { SalesRank: [Array] } } ]
*/
const getMatchingProductForId = async (options) => {
    let obj = {};
    /* eslint-disable no-param-reassign */
    if (options.IdList) {
        obj = options.IdList.reduce((prev, curr, index) => {
            prev[`IdList.Id.${index + 1}`] = curr;
            return prev;
        }, {});
        delete options.IdList;
    }
    /* eslint-enable no-param-reassign */
    obj = Object.assign({}, obj, options);
    const products = await callEndpoint('GetMatchingProductForId', obj);

    try {
        const productList = digResponseResult('GetMatchingProductForProductId', products);
        const ret = productList.map(p => p.Products.Product);
        return ret;
    } catch (err) {
        return products;
    }
};

/*
{ ReportType: '_GET_MERCHANT_LISTINGS_DATA_',
  ReportProcessingStatus: '_SUBMITTED_',
  EndDate: '2017-07-31T06:17:53+00:00',
  Scheduled: 'false',
  ReportRequestId: '56938017378',
  SubmittedDate: '2017-07-31T06:17:53+00:00',
  StartDate: '2017-07-31T06:17:53+00:00' }
*/
const requestReport = async (options) => {
    const result = await callEndpoint('RequestReport', options);
    const reportRequests = digResponseResult('RequestReport', result);
    return reportRequests.ReportRequestInfo;
};

// interesting note: there are tons of reports returned by this API,
// apparently Amazon auto pulls reports, and many reports pulled in the Seller Central
// interface will also show up here. Somewhere in the docs, it says that Amazon
// keeps all reports for 90 days.

/*
[ { ReportType: '_GET_MERCHANT_LISTINGS_DATA_',
    ReportProcessingStatus: '_DONE_',
    EndDate: '2017-07-31T06:09:35+00:00',
    Scheduled: 'false',
    ReportRequestId: '56937017378',
    StartedProcessingDate: '2017-07-31T06:09:39+00:00',
    SubmittedDate: '2017-07-31T06:09:35+00:00',
    StartDate: '2017-07-31T06:09:35+00:00',
    CompletedDate: '2017-07-31T06:09:46+00:00',
    GeneratedReportId: '5935233306017378' } ]
*/
const getReportRequestList = async (options = {}) => {
    let obj = {};
    obj = Object.assign({}, obj, options);
    const result = await callEndpoint('GetReportRequestList', obj);
    // NextToken is under result.GetReportRequestListResponse.GetReportRequestListResult
    const reportRequestList = digResponseResult('GetReportRequestList', result);
    return reportRequestList.ReportRequestInfo;
};

const getReport = async (options) => {
    const result = await callEndpoint('GetReport', options);
    return result;
};

const getReportList = async (options = {}) => {
    let obj = {};
    obj = Object.assign({}, obj, options);
    const result = await callEndpoint('GetReportList', obj);
    // NextToken should be in result.GetReportListResponse.GetReportListResult
    try {
        const cache = digResponseResult('GetReportList', result);
        const ret = {
            result: cache.ReportInfo,
            nextToken: cache.HasNext && cache.NextToken,
        };
        return ret;
    } catch (err) {
        return result;
    }
};

const getReportListByNextToken = async (options) => {
    const result = await callEndpoint('GetReportListByNextToken', options);
    try {
        const cache = digResponseResult('GetReportListByNextToken', result);
        const ret = {
            result: cache.ReportInfo,
            nextToken: cache.HasNext && cache.NextToken,
        };
        return ret;
    } catch (err) {
        return result;
    }
};

const getReportListAll = async (options = {}) => {
    let reports = [];
    const reportList = await getReportList(options);
    reports = reports.concat(reportList.result);
    let { nextToken } = reportList;
    /* eslint-disable no-await-in-loop */
    while (nextToken) {
        const nextPage = await getReportListByNextToken({ NextToken: nextToken });
        // eslint-disable-next-line prefer-destructuring
        nextToken = nextPage.nextToken;
        reports = reports.concat(nextPage.result);
        await sleep(2000);
    }
    return reports;
};

// TODO: should we emit events notifying of things happening inside here?
// TODO: need to test all report types with this function, because not all reports return
// the same set of data - some are not giving a ReportRequestId for some reason?!
// perhaps there was an error in requestReport() regarding this.

// TODO: _GET_FLAT_FILE_ORDERS_DATA_ seems to always result in a cancelled report
// TODO: _GET_FLAT_FILE_PENDING_ORDERS_DATA_ results in undefined reportRequestId
// TODO: undefined reportRequestId results in us downloading a large list of reports
// when we call getReportRequestList()
// TODO: need to improve the throttling mechanism, waiting 45 seconds per test minimum sucks.

// known to work if given a StartDate: _GET_FLAT_FILE_ORDERS_DATA_, _GET_AMAZON_FULFILLED_SHIPMENTS_DATA_
// known to require calling GetReportList (therefore not yet working): _GET_SELLER_FEEDBACK_DATA_
// _GET_AMAZON_FULFILLED_SHIPMENTS_DATA_
//
// unsure why not working: _GET_FLAT_FILE_ACTIONABLE_ORDER_DATA_ - i may not have any data.
// may require parameters? just cancells if not given parameters.
//  _GET_CONVERGED_FLAT_FILE_SOLD_LISTINGS_DATA_
//  _GET_CONVERGED_FLAT_FILE_ORDER_REPORT_DATA_
//  _GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_
//  _GET_FLAT_FILE_ALL_RDERS_DATA_BY_ORDER_DATE_
//  _GET_XML_ALL_ORDERS_DATA_BY_LAST_UPDATE_
//  _GET_XML_ALL_ORDERS_DATA_BY_ORDER_DATE_
//  _GET_FLAT_FILE_PENDING_ORDERS_DATA_ - may also have failed due to not having any pending orders?
// after I got to _GET_FLAT_FILE_PENDING_ORDERS_DATA_ .. getReportRequestList started throwing out
// "undefined" as a status. wtf?
//  _GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_
//  _GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_
//  _GET_XML_ALL_ORDERS_DATA_BY_LAST_UPDATE_
//  _GET_XML_ALL_ORDERS_DATA_BY_ORDER_DATE_


const requestAndDownloadReport = async (ReportType, file, reportParams = {}) => {
    async function checkReportComplete(reportRequestId) {
        console.log(`-- checking if report is complete ${reportRequestId}`);
        while (true) {
            const report = await getReportRequestList({
                ReportRequestIdList: [reportRequestId],
            });
            switch (report.ReportProcessingStatus) {
                case '_IN_PROGRESS_': // fallthrough intentional
                case '_SUBMITTED_': // fallthrough intentional
                    console.log(`-- retrying report ${reportRequestId} in 45 sec`);
                    await sleep(45000); // GetReportRequestList throttles to at most 10 requests, you get 1 back every 45 seconds
                    break;
                case '_CANCELLED_':
                    console.log(`-- cancelled: ${reportRequestId}`, report);
                    return { cancelled: true };
                case '_DONE_':
                    return report;
                case '_DONE_NO_DATA_':
                    return {};
                default:
                    console.log(`-- unknown status retry in 45 sec: ${report.ReportProcessingStatus}`, report);
                    await sleep(45000);
                    break;
            }
        }
    }

    console.log(`-- requesting report ${ReportType}`);
    const request = await requestReport({
        ReportType,
        ...reportParams,
    });
    const reportRequestId = request.ReportRequestId;
    await sleep(20000); // some requests may be available quickly, check after 20 sec
    const reportCheck = await checkReportComplete(reportRequestId);
    const ReportId = reportCheck.GeneratedReportId;
    // TODO: Some reports do not provide a GeneratedReportId and we need to call GetReportList to find the identifier!
    if (!ReportId) {
        console.warn('**** No ReportId received !! This is not yet handled');
        const reportList = await getReportList({
            ReportTypeList: [ReportType],
        });
        console.warn('**** reportList', reportList);
        return {};
        // TODO
    }
    const report = await getReport({ ReportId });
    if (file) {
        await writeFile(file, JSON.stringify(report, null, 4));
    }
    return report;
};

module.exports = {
    init,
    callEndpoint,
    getMarketplaces,
    listOrders,
    listFinancialEvents,
    listInventorySupply,
    getMatchingProductForId,
    requestReport,
    getReport,
    getReportList,
    getReportListByNextToken,
    getReportListAll,
    getReportRequestList,
    requestAndDownloadReport,
};
