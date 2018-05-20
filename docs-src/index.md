# mws-advanced

MWS-Advanced is a modern Javascript library to make use of the Amazon Merchant Web Service (MWS).
It uses ES6+ Javascript, and is intended for use with Node v9.0 or better. It provides a much
cleaner interface to MWS, translating the mess of XML based results that Amazon provides into
something that is much closer to what you're expecting in a Javascript environment. In the future,
it will handle most all of the behind-the-scenes dirty work involved in creating a functional MWS
application, such as throttling API calls.

# Example usage - Single instance

````
const mws = require('mws-advanced');

mws.init({
    accessKeyId: 'Your Amazon AWS access key',
    secretAccessKey: 'Your Amazon AWS secret access key',
    merchantId: 'Your Amazon AWS Merchant ID',
});

(async function () {
    // get a list of all marketplaces the account participates in
    const marketplaces = await mws.getMarketplaces();
    console.log(`Markets: ${JSON.stringify(marketplaces, null, 4)}`);

    // get a list of all orders in the last 7 days, on the North American (US) market
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const orders = await mws.listOrders({
        CreatedAfter: startDate,
        MarketplaceId: [ 'ATVDPKIKX0DER' ],
    });
    console.log(`Orders: ${JSON.stringify(orders, null, 4)}`);
})();

````

# Example usage - Multiple instance capability

````
const MWS = require('mws-advanced).MWSAdvanced;

(async function() {
    const mws = new MWS({
        accessKeyId: 'Your Amazon AWS access key',
        secretAccessKey: 'Your Amazon AWS secret access key',
        merchantId: 'Your Amazon AWS Merchant ID',
    });
    const marketplaces = await mws.getMarketplaces();
    console.log(`Markets: ${JSON.stringify(marketplaces, null, 4)}`);
})();
````

# Parameter validation

A large portion of the function of this library is to deal with parameter transformation and
validation -- allowing you to use familiar and convenient data types to interface to MWS, as well as
ensuring that your parameters are lexically correct, so that you don't waste time, bandwidth, etc
firing off requests to the MWS servers that simply cannot be fulfilled.  The MWS API for example,
has a rather unique implementation of List data, expecting parameters to be specified in a form such
as:
````
    ASINList.1='ASIN1'
    ASINList.2='ASIN2' ...
````

A function call requiring an ASIN List from this library, would accept this as a normal array:

````
    const results = await mws.callEndpoint('GetCompetitivePricingForASIN', {
        MarketplaceId: 'ATVPDKIKX0DER',
        ASINList: ['142210284X', '1844161668', '0989391108', 'B009NOF57C'],
    });
````

Additionally, you can use data types such as a Javascript Date object to specify a time/date stamp
to MWS, and that will be automatically converted into the ISO-8601 date string that MWS expects.

Similarly, if you attempt to pass un-parseable strings as dates, strings for integers, integers that
are out of the bounds MWS expects, negative numbers where only positives are allowed, etc, then
requests with that data will be failed with a ValidationError before ever being transmitted to MWS.

# Basic Throttling Support

There is currently support for a fairly basic retry model when API calls are throttled at the
service end.  The API definitions in lib/endpoints all contain information about how long, according
to the MWS documentation, requests of a specific type are throttled for.  When a throttle response
is returned by MWS, the internal APIs will hold the request for the restore-rate length of time, and
then retry the request.  The default number of retries per request is 2, which should be enough if
you are executing most of your requests serially.  So, if you are executing a large number of
requests in parallel, you will probably need to do some additional work behind the scenes to ensure
that you don't continuously spam MWS with requests that will be throttled.  Additional work on
improving this scheme will be undertaken in the future, and changes are welcome to enhance support
for this throughout the API.

Please see the [Getting Started](./manual/getting-started.html) page for more info.
