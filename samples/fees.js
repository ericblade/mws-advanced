const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const feeTest = {
            marketplaceId: 'ATVPDKIKX0DER',
            idType: 'ASIN',
            idValue: 'B002KT3XQM',
            isAmazonFulfilled: true,
            listingPrice: {
                currencyCode: 'USD',
                amount: '0.00',
            },
            shipping: {
                currencyCode: 'USD',
                amount: '0.00',
            },
        };

        const feeTest2 = {
            ...feeTest,
            idValue: 'B00IDD9TU8',
            isAmazonFulfilled: false,
        };

        const results = await mws.getMyFeesEstimate([feeTest, feeTest2]);

        console.log(JSON.stringify(results, null, 4));
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
