const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    const results = await mws.getInboundGuidanceForASIN({
        MarketplaceId: 'ATVPDKIKX0DER',
        ASINList: [
            // all invalid
            'B00IDD9TU8',
            // 'B00IH00CN0',
            // 'B00005N5PF',
            // valid
            'B071Z8LD77',

        ],
    });
    const results2 = await mws.getInboundGuidanceForSKU({
        MarketplaceId: 'ATVPDKIKX0DER',
        SellerSKUList: [
            // these will be invalid for anyone that isn't me, so replace
            // these with your own, or use an API to get one.
            // 'X2PAAKVG3Q',
            'CG-XR44-8EBL',
            '08-V303-2XUU',
        ],
    });
    console.warn(JSON.stringify(results, null, 4));
    console.warn(JSON.stringify(results2, null, 4));
}

main();
