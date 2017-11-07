# mws-advanced

Amazon Merchant Web Services API for Javascript

There are a lot of Amazon MWS interfaces in Javascript.

This one requires node 8.x, with the --harmony switch, as of August 10th, 2017. Or you can roll your own method for transpiling it, if you want.

None of them have (much of) any documentation, and just appear to assume that you already know how to use the Amazon API.

Very few of them are written to use modern Javascript constructs.  A few use Promises, but none are any newer than that.

This project, which uses the rather simple "mws-simple" as it's base, intends to solve both of those problems.

As this is a brand new project, documentation may be a little light to begin with, but I'm certainly going to write this in modern Javascript code, with Promises, and Await/Async, and everything else I can use to make my life easier.

Note that I am currently in a very slow process of writing an application that will make use of this code.  So, this code is getting put together as I need the API calls, and it's being put together to make my life easier.  I welcome any and all input, comments, questions, and especially pull requests, though.  If you want to shape it to fit your needs, that will probably help it fit my needs, and vice verse. :-)

For how to use this project, to start:

````
const mws = require('mws-advanced');
mws.init({
    accessKeyId: 'Your Amazon AWS access key',
    secretAccessKey: 'Your Amazon AWS secret access key',
    merchantId: 'Your Amazon AWS Merchant ID',
});
````

You may call any Amazon AWS API that is implemented in this interface, using the "callEndpoint" function.  The basics are:

````
// get a list of all MWS marketplaces you are a member of
mws.callEndpoint('ListMarketplaceParticipations');

// create a date object for 1 week ago, and get a list of all inventory modified in that time
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);
mws.callEndpoint('ListInventorySupply', { QueryStartDate: date.toISOString() });
````

For information on all available MWS endpoints, please see:

https://developer.amazonservices.com/gp/mws/docs.html

As the MWS API is a rather difficult bear to use coherently, additional functions will be added to make for a much easier to use Javascript API.  Such as:

````
    getMarketplaces()

    const result = await aws.getMarketplaces();
    console.log('Markets=', result.markets);
    console.log('MarketParticipations=', result.marketParticipations);
````
http://docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html

returns an object containing the markets and marketParticipations for the current user.
Skips market places that are known to be not good values (possibly test markets or scratchpads? it is not known what some of the market responses are, and tech support has not given any details)

````
    listOrders(options)

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const result = await mws.listOrders({ CreatedAfter: startDate.toISOString(), 'MarketplaceId.Id.1': 'A2ZV50J4W1RKNI' });
    console.log('Orders=', result);
````
https://docs.developer.amazonservices.com/en_UK/orders-2013-09-01/Orders_ListOrders.html

````
    listFinancialEvents()

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const result = mws.listFinancialEvents({ PostedAfter: startDate });
    console.log('Financial Events=', result);
````
https://docs.developer.amazonservices.com/en_US/finances/Finances_ListFinancialEvents.html

Returns a list of financial events

````
    listInventorySupply()

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const result = await aws.listInventorySupply({ QueryStartDateTime: startDate.toISOString() });
    console.log('Inventory=', result);
````
https://docs.developer.amazonservices.com/en_UK/fba_inventory/FBAInventory_ListInventorySupply.html

Returns a list of FBA inventory

// TODO: we have a possible/probable bug that is probably in flattenResult(),
// which is causing SupplyDetail from listInventorySupply,
// and several returns from getMatchingProductForId to appear
// to be completely empty.

````
    getMatchingProductForId()

    const result = await mws.getMatchingProductForId({
        MarketplaceId: 'ATVPDKIKX0DER',
        IdType: 'ASIN',
        IdList: [ 'B005NK7VTU' ],
    });
    console.log('Product=', result);
````
http://docs.developer.amazonservices.com/en_UK/products/Products_GetMatchingProductForId.html

Returns an Array of matching product information. Each item in the Array is an object containing Identifiers, AttributeSets, Relationships, SalesRankings


# Reporting:

Getting detailed reports from Amazon requires somewhat more advanced samples.  For example,
if you would like to get a report of all of your inventory, you can request the report called
````_GET_MERCHANT_LISTINGS_DATA_```` .  Note that the Report functions have a pretty low throttling
rate compared to other API function calls.  Also note that RequestReport() has an internal
throttling mechanism that doesn't show to the outside -- if you request a particular report
before Amazon is ready to generate a new version of that report, they will simply send you
the same request identifier as the last time you requested that report.  Please see
http://docs.developer.amazonservices.com/en_UK/reports/Reports_Overview.html

````
    requestReport()
    getReportRequestList()
    getReport()

    // you'll probably need to use these three functions in tandem, so here is a sample showing
    // how to do that -- note that instead of logging the data, it will write it to a file
    // called test.json

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function checkReportComplete(reportRequestId) {
        let done = false;
        while(!done) {
            console.log('** checking if report is complete');
            const report = await mws.getReportRequestList({ ReportRequestIdList: [ reportRequestId ] });
            done = report.ReportProcessingStatus === '_DONE_';
            if (!done) {
                console.log('** retrying in 45 seconds', report);
                await sleep(45000); // GetReportRequestList throttles are 10 requests at a time, you get one back every 45 seconds, max 80 per hour
            } else {
                return report;
            }
        }
    }

    async function testReporting() {
        console.log('** requesting report');
        const request = await mws.requestReport({ ReportType: '_GET_MERCHANT_LISTINGS_DATA_' });
        const reportRequestId = request.ReportRequestId;
        console.log('** reportRequestId=', reportRequestId);
        await sleep(1000);
        const report = await checkReportComplete(reportRequestId);
        const ReportId = reportRequestId.GeneratedReportId; // NOTE: Some reports will not provide a GeneratedReportId and you need to call GetReportList to find the identifier to send!
        const report = await mws.getReport({ ReportId });
        fs.writeFileSync('./test.json', JSON.stringify(report, null, 4));
        return await mws.getReport({ ReportId });
    }
````

Note that this rather lengthy set of code has now been encapsulated in

````
    requestAndDownloadReport()

    await mws.requestAndDownloadReport('_GET_MERCHANT_LISTINGS_ALL_DATA_','amzAllListings.json');
    await Promise.all([
        mws.requestAndDownloadReport(
            '_GET_AMAZON_FULFILLED_SHIPMENTS_DATA_',
            'amzFbaShipments.json',
            {
                StartDate: getTestDate(30), // a function that returns a ISO date X days ago
            },
        ),
        mws.requestAndDownloadReport(
            '_GET_FLAT_FILE_ORDERS_DATA_',
            'amzOrders.json',
            {
                StartDate: getTestDate(30),
            },
        ),
    ]);

````
Given a valid report type (see https://docs.developer.amazonservices.com/en_UK/reports/Reports_ReportType.html ), and an optional filename, will save the report to the given file, and return the report data. Third argument is options to pass to RequestReport API.

You can use this function to easily retrieve reports, but if you need more control over how reports are handled, you can use the functions above.

````
    getReportList()
    getReportListByNextToken()

    const list = await mws.getReportList(); // return all available reports
    let nextToken = list.nextToken;
    let reports = list.result;
    while(nextToken) {
        const nextPage = await mws.getReportListByNextToken({ NextToken: nextToken });
        reports.concat(nextPage.result);
        nextToken = nextPage.nextToken;
    }
    console.log(reports);
````
Return a list of reports, and a nextToken if provided in the return data. Return is an object
in form of { result: [ Array ], nextToken: (token | undefined) }

````
    getReportListAll()

    const reportList = await mws.getReportListAll({
        ReportTypeList: [ '_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_' ],
    });
    const report = await mws.getReport({ ReportId: reportList[0].ReportId });
    fs.writeFileSync('settlement.json', JSON.stringify(report, null, 4));
````

getReportListAll() calls getReportList(options), followed by any number of required (throttled!)
getReportListByNextToken calls, to return the entire list of available reports that match the
criteria presented.  For a list of options, see https://docs.developer.amazonservices.com/en_UK/reports/Reports_GetReportList.html

Return is identical to getReportList()
