/**
 * mws-advanced module for interacting with Amazon Merchant Web Services
 * @module mws-advanced
 */

// https://sellercentral.amazon.com/forums/thread.jspa?threadID=369774&tstart=75

// http://s3.amazonaws.com/devo.docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html

const { parseEndpoint } = require('./parseEndpoint');
const { getMarketplaces } = require('./helpers/getMarketplaces');
const { listOrderItems } = require('./helpers/listOrderItems');
const { listOrders } = require('./helpers/listOrders');
const { listFinancialEvents } = require('./helpers/listFinancialEvents');
const { listInventorySupply } = require('./helpers/listInventorySupply');
const { getMatchingProductForId } = require('./helpers/getMatchingProduct');

const {
    getLowestPricedOffersForASIN,
    getLowestPricedOffersForSKU,
} = require('./helpers/getLowestPricedOffers');

const {
    getProductCategoriesForAsins,
    getProductCategoriesForSkus,
} = require('./helpers/getProductCategories');

const { getMyFeesEstimate } = require('./helpers/getMyFeesEstimate');
const { listMatchingProducts } = require('./helpers/listMatchingProducts');
const constants = require('./constants');

const { getOrder } = require('./helpers/getOrder');

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
} = require('./helpers/reports');

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
