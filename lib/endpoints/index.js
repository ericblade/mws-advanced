/**
 * pull in all the separate endpoint modules and export them together
 */
// TODO: maybe we don't actually need this, and should just import them individually in
// modules that need them.. i'm not terribly hip on importing a ton of definitions that aren't
// necessary.
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
const recommendations = require('./recommendations');

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
    recommendations,
};
