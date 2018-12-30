const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const result = await mws.getOrder({ AmazonOrderId: ['YOUR AMAZON ORDER ID HERE'] });
        console.log(result, null, 4);
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
