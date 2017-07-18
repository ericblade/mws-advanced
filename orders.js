const endpoints = {
    ListOrders: {
        category: 'Orders',
        version: '2013-09-01',
        action: 'ListOrders',
    },
    ListOrdersByNextToken: {
        category: 'Orders',
        version: '2013-09-01',
        action: 'ListOrdersByNextToken',
    },
    GetOrder: {
        category: 'Orders',
        version: '2013-09-01',
        action: 'GetOrder',
    },
    ListOrderItems: {
        category: 'Orders',
        version: '2013-09-01',
        action: 'ListOrderItems',
    },
    ListOrderItemsByNextToken: {
        category: 'Orders',
        version: '2013-09-01',
        action: 'ListOrderItemsByNextToken',
    },
}

module.exports = {
    endpoints,
};
