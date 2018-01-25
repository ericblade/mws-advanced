const { callEndpoint } = require('./callEndpoint');
const { digResponseResult } = require('./dig-response-result');

// TODO: make a typedef for OrderItem and document it correctly
/**
 * @typedef OrderItemList
 * @param {string} orderId - Amazon Order ID
 * @param {string} nextToken - Token to provide to ListOrderItemsByNextToken if needed (no token = no need)
 * @param {Array} orderItems - Array of all the items in the order
 */

/**
 * Returns order items based on the AmazonOrderId that you specify.
 *
 * If you've pulled a list of orders using @see {@link ListOrders}, or have order identifiers
 * stored in some other fashion, then to find out what items are actually on the orders, you will
 * need to call ListOrderItems to obtain details about the items that were ordered.  The ListOrders
 * call does not give you any information about the items, except how many of them have shipped or
 * not shipped.
 *
 * If an Order is in the Pending state, ListOrderItems will not return any pricing or promotion
 * information. Once an order has left the Pending state, the following items will be returned:
 *
 * ItemTax, GiftWrapPrice, ItemPrice, PromotionDiscount, GiftWrapTax, ShippingTax, ShippingPrice,
 * ShippingDiscount
 *
 * @param {string} AmazonOrderId - 3-7-7 Amazon Order ID formatted string
 * @returns {OrderItemList}
 */
const listOrderItems = async (AmazonOrderId) => {
    const res = digResponseResult('ListOrderItems', await callEndpoint('ListOrderItems', { AmazonOrderId }));
    const arr = res.OrderItems.length ? res.OrderItems : [res.OrderItems];
    const meh = arr.map(x => x.OrderItem);
    const ret = {
        nextToken: res.nextToken,
        orderId: res.AmazonOrderId,
        orderItems: meh,
    };
    return ret;
};

module.exports = {
    listOrderItems,
};
