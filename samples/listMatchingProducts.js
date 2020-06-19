const MWS = require('..');
const keys = require('../test/keys.json');

const mws = new MWS(keys);

mws.init(keys);

async function main() {
    try {
        const results = await mws.listMatchingProducts({
            marketplaceId: 'ATVPDKIKX0DER',
            query: 'better made special potato sticks original',
        });
        console.warn(results);
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
