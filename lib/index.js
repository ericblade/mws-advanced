/**
 * mws-advanced module for interacting with Amazon Merchant Web Services
 * @module mws-advanced
 */

// https://sellercentral.amazon.com/forums/thread.jspa?threadID=369774&tstart=75

// http://s3.amazonaws.com/devo.docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html

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

const MWSAdvanced = require('./MwsAdvanced');

const mExports = {
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

module.exports = MWSAdvanced;
module.exports.MWSAdvanced = MWSAdvanced;
module.exports.constants = constants;
Object.assign(module.exports, mExports);
