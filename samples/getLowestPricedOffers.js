const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        // const ASINList = ['B010YSIKKY']; // '1844161668', '0989391108', 'B009NOF57C'
        const ASINList = ['B00005V3EZ', 'B010YSIKKY', 'B00IDD9TU8'];
        ASINList.forEach(async (asin) => {
            console.warn('asin=', asin);
            const results = await mws.getLowestPricedOffersForASIN({
                MarketplaceId: 'ATVPDKIKX0DER',
                ASIN: asin,
                ItemCondition: 'New',
            });
            console.log(JSON.stringify(results, null, 4));
        });
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
