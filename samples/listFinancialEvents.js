const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        const results = await mws.listFinancialEvents({ PostedAfter: startDate });
        console.warn(JSON.stringify(results));
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
