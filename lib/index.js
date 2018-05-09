/**
 * mws-advanced module for interacting with Amazon Merchant Web Services
 * @module mws-advanced
 */

// https://sellercentral.amazon.com/forums/thread.jspa?threadID=369774&tstart=75

// http://s3.amazonaws.com/devo.docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html

const { init, callEndpoint, parseEndpoint } = require('./callEndpoint');
const { getMarketplaces } = require('./get-marketplaces');
const { listOrderItems } = require('./list-order-items');
const { listOrders } = require('./list-orders');
const { listFinancialEvents } = require('./list-financial-events');
const { listInventorySupply } = require('./list-inventory-supply');
const { getMatchingProductForId } = require('./get-matching-product');
const { getLowestPricedOffersForASIN } = require('./get-lowest-priced-offers');
const { getProductCategoriesForAsins, getProductCategoriesForSkus } = require('./get-product-categories');
const { getMyFeesEstimate } = require('./get-my-fees-estimate');

const {
    getReport,
    getReportList,
    getReportListAll,
    getReportListByNextToken,
    getReportRequestList,
    requestAndDownloadReport,
    requestReport,
} = require('./reports');

module.exports = {
    init,
    callEndpoint,
    getMarketplaces,
    listOrderItems,
    listOrders,
    listFinancialEvents,
    listInventorySupply,
    getLowestPricedOffersForASIN,
    getMatchingProductForId,
    getMyFeesEstimate,
    getProductCategoriesForAsins,
    getProductCategoriesForSkus,
    getReport,
    getReportList,
    getReportListAll,
    getReportListByNextToken,
    getReportRequestList,
    parseEndpoint,
    requestAndDownloadReport,
    requestReport,
};
