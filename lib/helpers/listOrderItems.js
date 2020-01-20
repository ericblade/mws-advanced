/**
 * @module mws-advanced
 */
const parseOrderItems = require('../parsers/orderItems');

// TODO: make a typedef for OrderItem and document it correctly
/**
 * @typedef OrderItemList
 * Object hash containing:
 * orderId - Amazon Order ID in 3-7-7 format
 * orderItems - Array of OrderItems
 * nextToken - If the list of items is longer than one request can accommodate, a nextToken will
 * be returned to pass to listOrderItemsByNextToken
 *
 * @public
 * @param {string} orderId - Amazon Order ID
 * @param {string} nextToken - Token to provide to ListOrderItemsByNextToken if needed (no token = no need)
 * @param {Array} orderItems - Array of all the items in the order
 */

const listOrderItems = (api) => api.parseEndpoint(
    parseOrderItems,
    (AmazonOrderId) => ({ AmazonOrderId }),
)('ListOrderItems');

module.exports = listOrderItems;
