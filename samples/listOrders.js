const mws = require('..');
const keys = require('../test/keys.json');
const fs = require('fs');
const { MWS_MARKETPLACES } = require('../lib/constants');

mws.init(keys);

async function main() {
    try {
        const startDate = new Date('1/1/2018');
        console.warn(startDate);
        const results = await mws.listOrders({
            CreatedAfter: startDate,
            MarketplaceId: [MWS_MARKETPLACES.US],
        });
        fs.writeFileSync('amazon-orders.json', JSON.stringify(results, null, 4));
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
