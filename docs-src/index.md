# mws-advanced

MWS-Advanced is a modern Javascript library to make use of the Amazon Merchant Web Service (MWS).
It uses ES6+ Javascript, and is intended for use with Node v9.0 or better. It provides a much
cleaner interface to MWS, translating the mess of XML based results that Amazon provides into
something that is much closer to what you're expecting in a Javascript environment. In the future,
it will handle most all of the behind-the-scenes dirty work involved in creating a functional MWS
application, such as throttling API calls.

# Example usage

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
        MarketplaceId: [ 'A2ZV50J4W1RKNI' ],
    });
    console.log(`Orders: ${JSON.stringify(orders, null, 4)}`);
})();

````

Please see the [Getting Started](./getting-started.html) page for more info.
