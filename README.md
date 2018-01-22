[![codebeat badge](https://codebeat.co/badges/83ea05b8-db4e-4765-ae00-63169ef19c2e)](https://codebeat.co/projects/github-com-ericblade-mws-advanced-master)
[![Greenkeeper badge](https://badges.greenkeeper.io/ericblade/mws-advanced.svg)](https://greenkeeper.io/)
[![Documentation badge](./docs/badge.svg)](https://esdoc.org)
[![Coverage Status](https://coveralls.io/repos/ericblade/mws-advanced/badge.svg?branch=master)](https://coveralls.io/r/<account>/<repository>?branch=master)
# mws-advanced -- A modern Amazon Merchant Web Services API Interface for Javascript

## What does it do?

mws-advanced provides a modern, fast, and hopefully sensible APIs to connect your Javascript
application (node or browser) to the Amazon Merchant Web Services API.

mws-advanced uses the straight-forward and very basic functionality provided by
[mws-simple](https://github.com/ericblade/mws-simple) to provide a much more advanced library for
accessing MWS, than what has previously been available in the past.

## Documentation / Quick-Start (I've heard enough, let's write some code)
Automatically generated documentation is available at [Documentation](https://ericblade.github.io/mws-advanced/).

## Why a new mws library?

Although there are a whole lot of MWS libraries out there on the npm repository, few are actively
maintained, and even fewer are written using modern Javascript. Some use Promises, but none are
written to take advantage of the newest features of the language. Still fewer have documentation
that doesn't just assume you are intimately familiar with the Amazon MWS API already.

I am writing this to change that. I am writing a project that needs access to the MWS API, and to
do that, I needed code that interfaces well with modern code.  I need code that is documented well,
is intuitive to use, and doesn't leave my primary application stuck having to figure out all the
vagaries of an XML response transformed into a JSON result.  Or worse.

Most of all, though, this library is here to give you the pieces that I am using to build my
internal project with.  Enjoy! :-)

## Requirements

This requires node.js v9.0+ to run. If that's not your environment, you can setup Babel or some
other transpiler to make it work in older versions.  I'd be happy to accept pulls for this, or any
other reason, but it is not something I am at all concerned with.  Let's move the ecosystem forward!

## Development

This library is under heavy development.  Pull requests from all are welcome.  Since I am writing
a system that makes use of this library, my primary priority is to make it work for my specific use-
cases.  Your use cases may not match mine, so let's work together to create a fantastic library for
all of us :-)

## (OLD) Documentation

The below documentation is old, and outdated.

# Do not read this

This is the old documentation, left here so I can refer to it briefly. It will be deleted shortly.

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
