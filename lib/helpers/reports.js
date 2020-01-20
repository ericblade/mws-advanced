/** reporting functions
 * @module mws-advanced
*/

const { promisify } = require('util');
const fs = require('fs');

const errors = require('../errors');

/**
 * Promisified version of fs.writeFile
 * We like to use Promises. writeFile does not come in a Promise variant, currently.
 * Use util/promisify to make it work with Promises.
 * This is better than using writeFileSync. Trust me. :-)
 * @param {string} fileName - path/filename to write to
 * @param {string|Buffer} contents - what to write to file
 */
const writeFile = promisify(fs.writeFile);

const sleep = require('../util/sleep');

/**
 * @typedef ReportRequestInfo
 * @param {string} ReportType Type of Report Requested @see {@link REQUEST_REPORT_TYPES}
 * @param {string} ReportProcessingStatus Status of Report @see {@link REPORT_PROCESSING_STATUS_TYPES}
 * @param {string} EndDate ISO Date for Date Ending period
 * @param {boolean} Scheduled True if report is scheduled, false if immediate
 * @param {string} ReportRequestId Identifier to use with getReport to fetch the report when ready
 * @param {string} SubmittedDate ISO Date for Date request was submitted
 * @param {string} StartDate ISO Date for Date report begins at
 */
// TODO: convert ISO Dates to Date objects?

const requestReport = (api) => api.parseEndpoint((out) => out.ReportRequestInfo)('RequestReport');

// interesting note: there are tons of reports returned by this API,
// apparently Amazon auto pulls reports, and many reports pulled in the Seller Central
// interface will also show up here. Somewhere in the docs, it says that Amazon
// keeps all reports for 90 days.

// TODO: for some reason GetReportRequestListResult showsmentation twice.
/**
 * @typedef GetReportRequestListResult
 * @param {string} ReportType Type of Report Requested @see {@link REQUEST_REPORT_TYPES}
 * @param {string} ReportProcessingStatus Status of Report @see {@link REPORT_PROCESSING_STATUS_TYPES}
 * @param {string} EndDate ISO Date for Report End Period
 * @param {boolean} Scheduled True if report is scheduled, false if immediate
 * @param {string} ReportRequestId Identifier for the Report Request
 * @param {string} StartedProcessingDate ISO Date for time MWS started processing request
 * @param {string} StartDate ISO Date for Report Start Period
 * @param {string} CompletedDate ISO Date for time MWS completed processing request
 * @param {string} GeneratedReportId Identifier to use with getReport to retrieve the report
 */

// TODO: write a test to make sure nextToken is here correctly?
const reportRequestListParser = (out) => {
    let nextToken;
    try {
        nextToken = out.GetReportRequestListResponse.GetReportRequestListResult.NextToken;
    } catch (err) {
        //
    }
    return { nextToken, reportRequestList: out.ReportRequestInfo };
};

const getReportRequestList = (api) => api.parseEndpoint(reportRequestListParser)('GetReportRequestList');

const getReport = (api) => api.parseEndpoint((x) => x)('GetReport');

/**
 * TO DO: WRITE DOCUMENTATION
 */
const getReportListParser = (out) => {
    try {
        const ret = {
            result: out.ReportInfo,
            nextToken: out.HasNext && out.NextToken,
        };
        return ret;
    } catch (error) {
        return out;
    }
};

/**
 * TO DO: WRITE DOCUMENTATION
 */
const manageReportScheduleParser = (out) => {
    try {
        const ret = {
            count: out.Count,
            reportSchedule: out.ReportSchedule,
        };
        return ret;
    } catch (err) {
        return out;
    }
};

/**
 * TO DO: WRITE DOCUMENTATION
 */
const getReportScheduleListParser = (out) => {
    try {
        const ret = {
            nextToken: out.NextToken,
            hasNext: out.HasNext,
            reportSchedule: out.ReportSchedule,
        };
        return ret;
    } catch (err) {
        return out;
    }
};

/**
 * TO DO: WRITE DOCUMENTATION
 */
const updateReportAcknowledgementsParser = (out) => {
    try {
        const ret = {
            count: out.Count,
            reportInfo: out.ReportInfo,
        };
        return ret;
    } catch (error) {
        return out;
    }
};

const getReportList = (api) => api.parseEndpoint(getReportListParser)('GetReportList');

const getReportListByNextToken = (api) => api.parseEndpoint(getReportListParser)('GetReportListByNextToken');

const getReportListAll = (api) => async (options = {}) => {
    let reports = [];
    const reportList = await getReportList(api)(options);
    reports = reports.concat(reportList.result);
    let { nextToken } = reportList;
    /* eslint-disable no-await-in-loop */
    while (nextToken) {
        const nextPage = await getReportListByNextToken(api)({ NextToken: nextToken });
        // eslint-disable-next-line prefer-destructuring
        nextToken = nextPage.nextToken;
        reports = reports.concat(nextPage.result);
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


const requestAndDownloadReport = (api) => async (ReportType, file, reportParams = {}) => {
    async function checkReportComplete(reportRequestId) {
        console.log(`-- checking if report is complete ${reportRequestId}`);
        /* eslint-disable no-await-in-loop */
        while (true) {
            const report = await getReportRequestList(api)({
                ReportRequestIdList: [reportRequestId],
            });
            switch (report.reportRequestList.ReportProcessingStatus) {
                case '_IN_PROGRESS_': // fallthrough intentional
                case '_SUBMITTED_': // fallthrough intentional
                    console.log(`-- retrying report ${reportRequestId} in 45 sec`);
                    await sleep(45000); // GetReportRequestList throttles to at most 10 requests, you get 1 back every 45 seconds
                    break;
                case '_CANCELLED_':
                    console.log(`-- cancelled: ${reportRequestId}`, report);
                    return { cancelled: true };
                case '_DONE_':
                    return report.reportRequestList;
                case '_DONE_NO_DATA_':
                    return null;
                default:
                    console.log(`-- unknown status retry in 45 sec: ${report.ReportProcessingStatus}`, report);
                    await sleep(45000);
                    break;
            }
        }
    /* eslint-enable no-await-in-loop */
    }

    console.log(`-- requesting report ${ReportType}`);
    const request = await requestReport(api)({
        ReportType,
        ...reportParams,
    });
    const reportRequestId = request.ReportRequestId;
    await sleep(20000); // some requests may be available quickly, check after 20 sec
    const reportCheck = await checkReportComplete(reportRequestId);
    if (!reportCheck) return null;
    if (reportCheck.cancelled) {
        console.warn('******** report request cancelled by server', ReportType);
        throw new errors.RequestCancelled('Report cancelled by server');
    }
    let ReportId = reportCheck.GeneratedReportId;

    // When no ReportId is received, then call getReportList to find it.
    if (!ReportId) {
        const reportList = await getReportList(api)({
            ReportTypeList: [ReportType],
        });

        ReportId = reportList[reportList.length - 1].ReportId;
    }
    const report = await getReport(api)({ ReportId });
    if (file) {
        await writeFile(file, JSON.stringify(report, null, 4));
    }
    return report;
};

const manageReportSchedule = (api) => api.parseEndpoint(manageReportScheduleParser)('ManageReportSchedule');

const updateReportAcknowledgements = (api) => api.parseEndpoint(updateReportAcknowledgementsParser)('UpdateReportAcknowledgements');

const getReportScheduleList = (api) => api.parseEndpoint(getReportScheduleListParser)('GetReportScheduleList');

module.exports = {
    getReport,
    getReportList,
    getReportListAll,
    getReportListByNextToken,
    getReportRequestList,
    getReportScheduleList,
    requestAndDownloadReport,
    requestReport,
    manageReportSchedule,
    updateReportAcknowledgements,
};
