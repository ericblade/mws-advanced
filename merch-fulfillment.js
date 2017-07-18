const endpoints = {
    GetEligibleShippingServices: {
        category: 'MerchantFulfillment',
        version: '2015-06-01',
        action: 'GetEligibleShippingServices',
    },
    CreateShipment: {
        category: 'MerchantFulfillment',
        version: '2015-06-01',
        action: 'CreateShipment',
    },
    GetShipment: {
        category: 'MerchantFulfillment',
        version: '2015-06-01',
        action: 'GetShipment',
    },
    CancelShipment: {
        category: 'MerchantFulfillment',
        version: '2015-06-01',
        action: 'CancelShipment',
    },
}

module.exports = {
    endpoints,
};
