const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        const results = await mws.listFinancialEvents({ PostedAfter: startDate });
        console.log(JSON.stringify(results, null, 4));
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
