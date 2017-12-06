const { callEndpoint } = require('.');

// returns
/*
    LatestShipDate: [Array], OrderType: [Array], PurchaseDate: [Array], AmazonOrderId: [Array],
    BuyerEmail: [Array], LastUpdateDate: [Array], IsReplacementOrder: [Array], ShipServiceLevel: [Array],
    NumberOfItemsShipped: [Array], OrderStatus: [Array], SalesChannel: [Array], ShippedByAmazonTFM: [Array],
    IsBusinessOrder: [Array], LatestDeliveryDate: [Array], NumberOfItemsUnshipped: [Array],
    PaymentMethodDetails: [Array], BuyerName: [Array], EarliestDeliveryDate: [Array],
    OrderTotal: [Array], IsPremiumOrder: [Array], EarliestShipDate: [Array], MarketplaceId: [Array],
    FulfillmentChannel: [Array], PaymentMethod: [Array], ShippingAddress: [Array],
    IsPrime: [Array], ShipmentServiceLevelCategory: [Array]
*/
// TODO: if provide a NextToken then call ListOrdersByNextToken ?
// TODO: provide an option to automatically call ListOrdersByNextToken if NextToken is received?

/**
 * Return orders created or updated during a specific time frame
 * see https://docs.developer.amazonservices.com/en_UK/orders-2013-09-01/Orders_ListOrders.html
 *
 * @param {object} options
 * @param {Date} options.CreatedAfter Select orders created at or after the given Date
 * @param {Date} options.CreatedBefore Select orders created at or before the given Date
 * @param {Date} options.LastUpdatedAfter Select orders updated at or after the given Date
 * @param {Date} options.LastUpdatedBefore Select orders updated at or before the given Date
 * @param {string} options.OrderStatus OrderStatus, see MWS doc page
 * @param {string} options.MarketplaceId Marketplace to search
 * @param {string} options.FulfillmentChannel AFN for Amazon fulfillment, MFN for merchant
 * @param {string} options.PaymentMethod All, COD, CVS, Other
 * @param {string} options.BuyerEmail Search for orders with given Email address
 * @param {string} options.SellerOrderId Specified seller order ID
 * @param {string} options.MaxResultsPerPage Max number of results to return, 1 <=> 100
 * @param {string} options.TFMShipmentStatus See MWS doc page
 * @returns {object}
 */
const listOrders = async (options) => {
    const results = await callEndpoint('ListOrders', options);
    return results.Orders.Order;
};

module.exports = { listOrders };
