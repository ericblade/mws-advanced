const fs = require('fs');
const mws = require('..');

const keys = {
    accessKeyId: 'PUT YOUR ACCESS KEY HERE',
    secretAccessKey: 'PUT YOUR SECRET ACCESS KEY HERE',
    merchantId: 'PUT YOUR MERCHANT ID HERE',
};

//const test = require('./settlement-debits-credits-module');
const test = require('./inventory-supply-module');

async function main() {
    return await test(keys);
}

main();
