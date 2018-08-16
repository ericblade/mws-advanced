/**
 * mws-advanced module for interacting with Amazon Merchant Web Services
 * @module mws-advanced
 */

// https://sellercentral.amazon.com/forums/thread.jspa?threadID=369774&tstart=75

// http://s3.amazonaws.com/devo.docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html

const { init, callEndpoint } = require('./callEndpoint');
const { parseEndpoint } = require('./parseEndpoint');
const { getMarketplaces } = require('./get-marketplaces');
const { listOrderItems } = require('./list-order-items');
const { listOrders } = require('./list-orders');
const { listFinancialEvents } = require('./list-financial-events');
const { listInventorySupply } = require('./list-inventory-supply');
const { getMatchingProductForId } = require('./get-matching-product');

const {
    getLowestPricedOffersForASIN,
    getLowestPricedOffersForSKU,
} = require('./get-lowest-priced-offers');

const {
    getProductCategoriesForAsins,
    getProductCategoriesForSkus,
} = require('./get-product-categories');

const { getMyFeesEstimate } = require('./get-my-fees-estimate');
const { listMatchingProducts } = require('./list-matching-products');
const constants = require('./constants');

const { getOrder } = require('./get-order');

const {
    getReport,
    getReportList,
    getReportListAll,
    getReportListByNextToken,
    getReportRequestList,
    getReportScheduleList,
    requestAndDownloadReport,
    requestReport,
    manageReportSchedule,
    updateReportAcknowledgements,
} = require('./reports');

/**
 * Create a new instance of MWSAdvanced, calling init(), and binding this instance of callEndpoint
 * to this instance of MWSAdvanced.
 *
 * @param {object} rest - passed on to @see {@link #init}
 * @returns {MWSAdvanced} - new instance of MWSAdvanced
 */
function MWSAdvanced(...rest) {
    if (!(this instanceof MWSAdvanced)) return new MWSAdvanced(...rest);
    this.mws = this.init(...rest);
    this.callEndpoint = this.callEndpoint.bind(this);
    return this;
}

const mExports = {
    init,
    callEndpoint,
    getMarketplaces,
    getOrder,
    listOrderItems,
    listOrders,
    listFinancialEvents,
    listInventorySupply,
    listMatchingProducts,
    getLowestPricedOffersForASIN,
    getLowestPricedOffersForSKU,
    getMatchingProductForId,
    getMyFeesEstimate,
    getProductCategoriesForAsins,
    getProductCategoriesForSkus,
    getReport,
    getReportList,
    getReportListAll,
    getReportListByNextToken,
    getReportRequestList,
    getReportScheduleList,
    parseEndpoint,
    requestAndDownloadReport,
    requestReport,
    manageReportSchedule,
    updateReportAcknowledgements,
};

MWSAdvanced.prototype = {
    ...MWSAdvanced.prototype,
    ...mExports,
    init(...rest) {
        const m = init(...rest);
        this.mws = m;
        return m;
    },
};

module.exports = {
    MWSAdvanced,
    constants,
    ...mExports,
};
