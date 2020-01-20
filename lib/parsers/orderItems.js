const {
    forceArray,
    transformObjectKeys,
    stringToBool,
    stringToInt,
} = require('../util/transformers');

/**
 * @typedef OrderItem - see https://docs.developer.amazonservices.com/en_UK/orders-2013-09-01/Orders_Datatypes.html#OrderItem
 */

/**
 * @typedef OrderItemsList - a list of OrderItems - see https://docs.developer.amazonservices.com/en_UK/orders-2013-09-01/Orders_Datatypes.html#OrderItem
 */

/**
 * @typedef orderItemsList - the mws-advanced items list
 * @param {orderItems} - array of OrderItem
 * @param {nextToken} - string for next token to provide to calls to ListOrderItemsByNextToken
 * @param {orderId} - string with the Amazon Order ID
 */

/**
 * Transform known integer and bool fields from strings to real integer and boolean
 *
 * @private
 * @param {OrderItem} item - OrderItem
 * @returns {OrderItem} - OrderItem with the quantities parseInt()ed, and bools converted from strings
 */

function transformIntsAndBools(item) {
    const {
        quantityOrdered,
        quantityShipped,
        isGift,
        productInfo = {},
        ...restItem
    } = item;
    const {
        numberOfItems,
        ...restProductInfo
    } = productInfo;

    return {
        ...restItem,
        isGift: stringToBool(isGift),
        quantityOrdered: stringToInt(quantityOrdered),
        quantityShipped: stringToInt(quantityShipped),
        productInfo: {
            ...restProductInfo,
            numberOfItems: stringToInt(numberOfItems),
        },
    };
}

/**
 * Transform MWS OrderItemsList
 *
 * @private
 * @param {OrderItemsList} orderItemsList - mws OrderItemsList
 * @returns {orderItemsList}
 */
const parseOrderItems = (orderItemsList) => {
    const { NextToken: nextToken, AmazonOrderId: orderId } = orderItemsList;
    const arr = forceArray(orderItemsList.OrderItems.OrderItem);

    const orderItems = arr.map((x) => transformIntsAndBools(transformObjectKeys(x)));

    return {
        orderItems,
        nextToken,
        orderId,
    };
};


module.exports = parseOrderItems;
