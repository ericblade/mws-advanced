const endpoints = {
    GetInboundGuidanceForSKU: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetInboundGuidanceForSKU',
    },
    GetInboundGuidanceForASIN: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetInboundGuidanceForASIN',
    },
    CreateInboundShipmentPlan: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'CreateInboundShipmentPlan',
    },
    CreateInboundShipment: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'CreateInboundShipment',
    },
    UpdateInboundShipment: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'UpdateInboundShipment',
    },
    GetPreorderInfo: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetPreorderInfo',
    },
    ConfirmPreorder: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'ConfirmPreorder',
    },
    GetPrepInstructionsForSKU: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetPrepInstructionsForSKU',
    },
    GetPrepInstructionsForASIN: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetPrepInstructionsForASIN',
    },
    PutTransportContent: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'PutTransportContent',
    },
    EstimateTransportRequest: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'EstimateTransportRequest',
    },
    GetTransportContent: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetTransportContent',
    },
    ConfirmTransportRequest: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'ConfirmTransportRequest',
    },
    VoidTransportRequest: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'VoidTransportRequest',
    },
    GetPackageLabels: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetPackageLabels',
    },
    GetUniquePackageLabels: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetUniquePackageLabels',
    },
    GetPalletLabels: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetPalletLabels',
    },
    GetBillOfLading: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'GetBillOfLading',
    },
    ListInboundShipments: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'ListInboundShipments',
    },
    ListInboundShipmentsByNextToken: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'ListInboundShipmentsByNextToken',
    },
    ListInboundShipmentItems: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'ListInboundShipmentItems',
    },
    ListInboundShipmentItemsByNextToken: {
        category: 'FulfillmentInboundShipment',
        version: '2010-10-01',
        action: 'ListInboundShipmentItemsByNextToken',
    },
};

module.exports = {
    endpoints,
};
