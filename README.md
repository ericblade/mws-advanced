# mws-advanced

Amazon Merchant Web Services API for Javascript

There are a lot of Amazon AWS interfaces in Javascript.

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
    const result = await aws.listOrders({ QueryStartDateTime: startDate.toISOString() });
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

