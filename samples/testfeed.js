const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const results = await mws.callEndpoint('SubmitFeed', {
            'MarketplaceIdList.Id.1': 'ATVPDKIKX0DER',
            FeedType: '_POST_FLAT_FILE_LISTINGS_DATA_',
            feedContent:
`sku\tproduct-id\tproduct-id-type\tprice\tquantity
test1\tB075ZFDXS4\t1\t99.99\t1`,
        });
        console.warn('* results', JSON.stringify(results, null, 4));
    } catch (err) {
        console.warn('* err', JSON.stringify(err, null, 4));
    }
}

main();
