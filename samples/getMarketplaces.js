const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const marketplaces = await mws.getMarketplaces();
        console.warn(marketplaces);
    } catch (err) {
        console.warn('* error', err);
    }
}

main();