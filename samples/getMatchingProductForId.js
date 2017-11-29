const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const results = await mws.getMatchingProductForId({
            MarketplaceId: 'ATVPDKIKX0DER',
            IdType: 'ASIN',
            IdList: ['B005NK7VTU'],
        });

        console.warn(JSON.stringify(results, null, 4));
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
