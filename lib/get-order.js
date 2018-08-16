const { parseEndpoint } = require('./parseEndpoint');

/**
 * Return orders by ID, i.e. Amazon Order ID.
 * see https://docs.developer.amazonservices.com/en_UK/orders-2013-09-01/Orders_GetOrder.html
 *
 * @param {object} options
 * @param {string[]} options.A list of AmazonOrderId values. An AmazonOrderId is an Amazon-defined order identifier, in 3-7-7 format.
 * @returns {object} A list of orders
 */

const getOrder = parseEndpoint(out => out.Orders.Order)('GetOrder');

module.exports = { getOrder };
