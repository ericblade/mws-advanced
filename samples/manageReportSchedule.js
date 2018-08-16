const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

/**
 * Example of how the report scheduler could work.
 * TO DO: This function could be broken out as a wrapper function to create and download scheduled reports.
 * @param {string} ReportType MWS' reporttype enumeration of the report to be requested.
 * See https://docs.developer.amazonservices.com/en_US/reports/Reports_ReportType.html
 * @param {string} Schedule
 * @param {Function} callbackProcessReports function which is called when reports are retrieved,
 * e.g. a processing function
 */
async function main(ReportType, Schedule, callbackProcessReports) {
    // NOTE: HIGHLY EXPERIMENTAL!
    // This function should work, but doesn't. For more information also
    // see the comments in ./lib/reports.js. Some reports are cancelled automatically
    // other reports do get scheduled but they return _DONE_NO_DATA_ even if data
    // is available!
    let timer;

    switch (Schedule) {
        case '_15_MINUTES_':
            timer = 1000 * 60 * 15;
            break;
        case '_30_MINUTES_':
            timer = 1000 * 60 * 30;
            break;
        case '_1_HOUR_':
            timer = 1000 * 60 * 60;
            break;
        case '_2_HOURS_':
            timer = 1000 * 60 * 60 * 2;
            break;
        case '_4_HOURS_':
            timer = 1000 * 60 * 60 * 4;
            break;
        case '_8_HOURS_':
            timer = 1000 * 60 * 60 * 8;
            break;
        case '_12_HOURS_':
            timer = 1000 * 60 * 60 * 12;
            break;
        case '_1_DAY_':
            timer = 1000 * 60 * 60 * 24;
            break;
        case '_2_DAYS_':
            timer = 1000 * 60 * 60 * 24 * 2;
            break;
        case '_72_HOURS_':
            timer = 1000 * 60 * 60 * 24 * 3;
            break;
        case '_1_WEEK_':
            timer = 1000 * 60 * 60 * 24 * 7;
            break;
        case '_14_DAYS_':
            timer = 1000 * 60 * 60 * 24 * 14;
            break;
        case '_15_DAYS_':
            timer = 1000 * 60 * 60 * 24 * 15;
            break;
        case '_30_DAYS_':
            timer = 1000 * 60 * 60 * 24 * 30;
            break;
        case '_NEVER_':
            timer = null;
            break;
        default:
            throw Error('Should not be able to get here');
    }

    let count = 0;
    (async function scheduleAndGetReports() {
        console.log('0. Starting ===');
        try {
            if (count === 0) {
                console.log('1. Scheduling report ===');
                try {
                    await mws.manageReportSchedule({ ReportType, Schedule });
                    if (Schedule === '_NEVER_') {
                        console.log('Success: report is no longer scheduled.');
                        return; // the scheduled report is deleted, there is no need to try to
                        // download a report that does not exist.
                    }
                } catch (error) {
                    throw Error('Could not schedule report using manageReportSchedule');
                }
            }

            console.log('2. Get a list of the reports ready to be downloaded ===');
            const reportList = await mws.getReportListAll({
                Acknowledged: false,
                ReportTypeList: ['_GET_FLAT_FILE_ORDERS_DATA_'],
            });

            console.log('3. Process the reports ===');
            reportList
                .filter(report => !!report)
                .forEach(async ({ ReportRequestId }) => {
                    const downloadedReport = await mws.getReport({ ReportId: ReportRequestId });
                    await mws.updateReportAcknowledgements({ ReportIdList: [ReportRequestId] });
                    callbackProcessReports(downloadedReport);
                });
        } catch (err) {
            console.warn('* error', err);
        }
        console.log(`Iteration (${count}) complete. Iterating again in: ${timer / 1000} seconds`);
        count += 1;
        setTimeout(scheduleAndGetReports, timer);
    }());
}

main('_GET_FLAT_FILE_ORDERS_DATA_', '_15_MINUTES_', console.log);
