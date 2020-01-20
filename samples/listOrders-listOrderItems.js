const mws = require('..');
const keys = require('../test/keys.json');
const fs = require('fs');
const { MWS_MARKETPLACES } = require('../lib/constants');

mws.init(keys);

async function main() {
    try {
        // const startDate = new Date('1/1/2018');
        // console.warn(`** Finding orders since ${startDate}`);
        // const results = await mws.listOrders({
        //     CreatedAfter: startDate,
        //     MarketplaceId: [MWS_MARKETPLACES.US],
        // });
        // fs.writeFileSync('amazon-orders.json', JSON.stringify(results, null, 4));

        // const order = results[0];
        // const orderItems = await mws.listOrderItems(order.AmazonOrderId);

        const getOrderRes = await mws.getOrder({ AmazonOrderId: ['111-6373103-7857033','111-3972635-5621019'] });
        // console.warn('* orderItems=', JSON.stringify(orderItems));
        console.warn('* getOrderRes=', getOrderRes);
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
