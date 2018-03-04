const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        // const ASINList = ['B010YSIKKY']; // '1844161668', '0989391108', 'B009NOF57C'
        // const ASINList = ['B00005V3EZ', 'B010YSIKKY', 'B00IDD9TU8'];
        // const ASINList = ['B00IDD9TU8', 'B00IH00CN0', 'B00WHCK496', 'B00H7LLKJA', 'B00OMCM8W0', 'B00IH057XA', 'B00IQY12WM', 'B00IQY12WM', 'B00NXLNHXK', 'B00IT5R23G', 'B00PR3KZWS'];
        const ASINList = ['B0014QABX0']; // item with multiple buy-boxes possible
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
