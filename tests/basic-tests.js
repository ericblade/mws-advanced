const mws = require('..');

const keys = require('./keys.json');

mws.init(keys);

async function main() {
    // https://docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html
    console.warn('* calling getMarketplaces()');

    const marketplacesResults = await mws.getMarketplaces();
    // console.warn('* results=', marketplacesResults);
    const marketsList = marketplacesResults.markets; // TODO: wtf is wrong with results.marketParticipations ?
    let marketsObj = {};
    if (!marketsList || !marketsList.length) {
        throw(new Error('Expected at least one market. Received ' + JSON.stringify(marketsplacesResults)));
    }
    console.warn(`* getMarketsplaces returns ${marketsList.length} results, expected > 0`);
    // build a list that fits the expected format for API calls.
    marketsList.forEach((market, index) => {
        console.warn(`* Marketplace: ${market.MarketplaceId}`);
        marketsObj[`MarketplaceId.Id.${index+1}`] = market.MarketplaceId;
    });
    // console.warn('* markets=', marketsObj);

    // TODO: add GetServiceStatus call at very end of tests -- it has a maximum quota of *2*, with a restore rate of 1 every five minutes. ugh.

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    let params = {
        ...marketsList,
        CreatedAfter: startDate.toISOString(),
    };

    // https://docs.developer.amazonservices.com/en_US/orders-2013-09-01/Orders_ListOrders.html
    console.warn('* calling listOrders', params);

    const listOrdersResults = await mws.listOrders({
        ...marketsObj,
        CreatedAfter: startDate.toISOString(),
    });
    if (listOrdersResults.ErrorResponse) {
        throw(new Error('Received ErrorResponse on ListOrders ' + JSON.stringify(listOrdersResults)));
    }
    if (!listOrdersResults.length) {
        throw(new Error('Received 0 orders, expected > 0 ' + JSON.stringify(listOrdersResults)));
    }
    console.warn(`* received ${listOrdersResults.length} orders`);

    const orderObj = {};
    for (let i = 0; i < listOrdersResults.length && i <= 4; i++) {
        const order = listOrdersResults[i];
        console.warn(`* Order ${order.AmazonOrderId}`);
        orderObj[`AmazonOrderId.Id.${i+1}`] = order.AmazonOrderId;
    };

    params = {
        ...orderObj,
    };
    // https://docs.developer.amazonservices.com/en_US/orders-2013-09-01/Orders_GetOrder.html
    const getOrderResults = await mws.callEndpoint('GetOrder', params);
    console.warn('* getOrderResults', getOrderResults);
}

main();
