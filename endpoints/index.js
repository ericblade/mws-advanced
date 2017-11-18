const feeds = require('./feeds.js');
const finances = require('./finances.js');
const inbound = require('./inbound.js');
const inventory = require('./inventory.js');
const outbound = require('./outbound.js');
const merchFulfillment = require('./merch-fulfillment.js');
const orders = require('./orders.js');
const products = require('./products.js');
const sellers = require('./sellers.js');
const reports = require('./reports.js');

module.exports = {
    feeds,
    finances,
    inbound,
    inventory,
    outbound,
    merchFulfillment,
    orders,
    products,
    sellers,
    reports,
};
