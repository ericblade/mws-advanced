const mws = require('..');

const keys = require('./keys.json');

mws.init(keys);

async function main() {
    // https://docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html
    console.warn('* calling getMarketplaces()');

    const marketplacesResults = await mws.getMarketplaces();
    const marketsList = marketplacesResults.markets; // TODO: wtf is wrong with results.marketParticipations ?
    let marketsObj = {};
    if (!marketsList || !marketsList.length) {
        throw(new Error('Expected at least one market. Received ' + JSON.stringify(marketsplacesResults)));
    }
    console.warn(`* getMarketplaces returns ${marketsList.length} results, expected > 0`);

    const marketIds = Object.keys(marketsList).map(market => marketsList[market].MarketplaceId);

    // TODO: add GetServiceStatus call at very end of tests -- it has a maximum quota of *2*, with a restore rate of 1 every five minutes. ugh.

    const startDate = new Date();
    // startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(startDate.getDate() - 2);

    let params = {
        MarketplaceId: marketIds,
        CreatedAfter: startDate,
    };

    // https://docs.developer.amazonservices.com/en_US/orders-2013-09-01/Orders_ListOrders.html
    console.warn('* calling listOrders', params);

    const listOrdersResults = await mws.listOrders(params);
    if (listOrdersResults.ErrorResponse) {
        throw(new Error('Received ErrorResponse on ListOrders ' + JSON.stringify(listOrdersResults)));
    }
    if (!listOrdersResults.length) {
        throw(new Error('Received 0 orders, expected > 0 ' + JSON.stringify(listOrdersResults)));
    }
    console.warn(`* received ${listOrdersResults.length} orders`);

    const orderIds = Object.keys(listOrdersResults).map(order => listOrdersResults[order].AmazonOrderId);
    params = {
        AmazonOrderId: orderIds,
    };
    // https://docs.developer.amazonservices.com/en_US/orders-2013-09-01/Orders_GetOrder.html
    const getOrderResults = await mws.callEndpoint('GetOrder', params);
    console.warn('* getOrderResults', getOrderResults);

    console.warn('* Done.');
}

main();
