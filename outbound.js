const endpoints = {
    GetFulfillmentPreview: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'GetFulfillmentPreview',
    },
    CreateFulfillmentOrder: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'CreateFulfillmentOrder',
    },
    UpdateFulfillmentOrder: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'UpdateFulfillmentOrder',
    },
    GetFulfillmentOrder: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'GetFulfillmentOrder',
    },
    ListAllFulfillmentOrders: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'ListAllFulfillmentOrders',
    },
    ListAllFulfillmentOrdersByNextToken: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'ListAllFulfillmentOrdersByNextToken',
    },
    GetPackageTrackingDetails: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'GetPackageTrackingDetails',
    },
    CancelFulfillmentOrder: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'CancelFulfillmentOrder',
    },
    ListReturnReasonCodes: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'FulfillmentOutboundShipment',
    },
    CreateFulfillmentReturn: {
        category: 'FulfillmentOutboundShipment',
        version: '2010-10-01',
        action: 'CreateFulfillmentReturn',
    },
};

module.exports = {
    endpoints,
};
