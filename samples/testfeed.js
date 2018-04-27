const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const results = await mws.callEndpoint('SubmitFeed', {
            'MarketplaceIdList.Id.1': 'ATVPDKIKX0DER',
            FeedType: '_POST_FLAT_FILE_PRICEANDQUANTITYONLY_UPDATE_DATA_',
            feedContent:
`sku\tprice\tminimum-seller-allowed-price\tmaximum-seller-allowed-price\tquantity\thandling-time\tfulfillment-channel
PO-TON5-ZUPT\t39.99\t9.99\t199.99\t0\t\t`,
        });
        console.warn('* results', JSON.stringify(results, null, 4));
    } catch (err) {
        console.warn('* err', JSON.stringify(err, null, 4));
    }
}

main();
