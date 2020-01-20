# mws-advanced

MWS-Advanced is a modern Javascript library to make use of the Amazon Merchant Web Service (MWS).
It uses ES6+ Javascript, and is intended for use with Node v9.0 or better. It provides a much
cleaner interface to MWS, translating the mess of XML based results that Amazon provides into
something that is much closer to what you're expecting in a Javascript environment. In the future,
it will handle most all of the behind-the-scenes dirty work involved in creating a functional MWS
application, such as throttling API calls.

# Example usage - Single instance

````
const mws = require('@ericblade/mws-advanced');

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
const MWS = require('@ericblade/mws-advanced');

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

When a request has been throttled by Amazon, the library will attempt to automatically retry that
request until it does succeed. Please see the Queue.js file for specifics as to how that works.
(the documentation will be updated to cover the new Queue mechanism in the future)

Please see the [Getting Started](./manual/getting-started.html) page for more info.
