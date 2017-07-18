# mws-advanced

Amazon Merchant Web Services API for Javascript

There are a lot of Amazon AWS interfaces in Javascript.

None of them have (much of) any documentation, and just appear to assume that you already know how to use the Amazon API.

Very few of them are written to use modern Javascript constructs.  A few use Promises, but none are any newer than that.

This project, which uses the rather simple "mws-simple" as it's base, intends to solve both of those problems.

As this is a brand new project, documentation may be a little light to begin with, but I'm certainly going to write this in modern Javascript code, with Promises, and Await/Async, and everything else I can use to make my life easier.

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

returns an object containing the markets and marketParticipations for the current user.
Skips market places that are known to be not good values (possibly test markets or scratchpads? it is not known what some of the market responses are, and tech support has not given any details)

See http://docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html

````
    listOrders(options)

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const result = await aws.listOrders({ QueryStartDateTime: startDate.toISOString() });
    console.log('Orders=', result);
````
