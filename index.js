const { promisify } = require('util');
const fs = require('fs');

const writeFile = promisify(fs.writeFile);

const { init, callEndpoint } = require('./lib');
const sleep = require('./lib/sleep');

const { getMarketplaces } = require('./lib/get-marketplaces');
const { listOrders } = require('./lib/list-orders');
const { listFinancialEvents } = require('./lib/list-financial-events');
const { listInventorySupply } = require('./lib/list-inventory-supply');
const { getMatchingProductForId } = require('./lib/get-matching-product');
const { getLowestPricedOffersForASIN } = require('./lib/get-lowest-priced-offers');

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
    return result.ReportRequestInfo;
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
    const result = await callEndpoint('GetReportRequestList', options);
    // NextToken is under result.GetReportRequestListResponse.GetReportRequestListResult
    return result.ReportRequestInfo;
};

const getReport = async (options) => {
    const result = await callEndpoint('GetReport', options);
    return result;
};

const getReportList = async (options = {}) => {
    const result = await callEndpoint('GetReportList', options);
    // NextToken should be in result.GetReportListResponse.GetReportListResult
    try {
        const ret = {
            result: result.ReportInfo,
            nextToken: result.HasNext && result.NextToken,
        };
        return ret;
    } catch (err) {
        return result;
    }
};

const getReportListByNextToken = async (options) => {
    const result = await callEndpoint('GetReportListByNextToken', options);
    try {
        const ret = {
            result: result.ReportInfo,
            nextToken: result.HasNext && result.NextToken,
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
    /* eslint-enable no-await-in-loop */
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
        /* eslint-disable no-await-in-loop */
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
        /* eslint-enable no-await-in-loop */
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
    getLowestPricedOffersForASIN,
};
