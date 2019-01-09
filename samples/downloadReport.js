const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

/* eslint-disable dot-notation */

async function main() {
    try {
        // TODO: we need a function to download an existing report if it was created in the last X,
        // otherwise request a new one, because Amazon doesn't throttle all of the things.
        const results = await mws.requestAndDownloadReport('_GET_RESTOCK_INVENTORY_RECOMMENDATIONS_REPORT_', './rec.json');
        // console.warn('* done?', results);
        const res = results.filter(x => parseInt(x['Recommended Order Quantity'], 10) > 0);
        res.forEach(x => console.warn('* ', x['Product Description'], x['ASIN'], x['Supplier'], x['Recommended Order Quantity'], x['Recommended Order Date']));
    } catch (err) {
        console.warn('* err=', err);
    }
}

main();
