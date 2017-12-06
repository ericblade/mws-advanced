const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const results = await mws.callEndpoint('GetCompetitivePricingForASIN', {
            MarketplaceId: 'ATVPDKIKX0DER',
            ASINList: ['142210284X', '1844161668', '0989391108', 'B009NOF57C'],
        });
        console.log(JSON.stringify(results, null, 4));
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
