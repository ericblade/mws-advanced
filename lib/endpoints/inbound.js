
const generateEndpoints = require('./endpoints-utils');

const categoryName = 'FulfillmentInboundShipment';

const apiVersion = '2010-10-01';

const endpointList = [
    'GetInboundGuidanceForSKU',
    'GetInboundGuidanceForASIN',
    'CreateInboundShipmentPlan',
    'CreateInboundShipment',
    'UpdateInboundShipment',
    'GetPreorderInfo',
    'ConfirmPreorder',
    'GetPrepInstructionsForSKU',
    'GetPrepInstructionsForASIN',
    'PutTransportContent',
    'EstimateTransportRequest',
    'GetTransportContent',
    'ConfirmTransportRequest',
    'VoidTransportRequest',
    'GetPackageLabels',
    'GetUniquePackageLabels',
    'GetPalletLabels',
    'GetBillOfLading',
    'ListInboundShipments',
    'ListInboundShipmentsByNextToken',
    'ListInboundShipmentItems',
    'ListInboundShipmentItemsByNextToken',
    'GetServiceStatus',
];

const newEndpointList = {
    ListInboundShipments: {
        throttle: {
            maxInFlight: 30,
            restoreRate: 120,
        },
        params: {
            ShipmentStatusList: {
                type: 'xs:string',
                required: false,
                list: 'ShipmentStatusList.member',
            },
            ShipmentIdList: {
                type: 'xs:string',
                required: false,
                list: 'ShipmentIdList.member',
            },
            LastUpdatedAfter: {
                type: 'xs:dateTime',
                required: false,
            },
            LastUpdatedBefore: {
                type: 'xs:dateTime',
                required: false,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            ShipmentData: {
                type: 'InboundShipmentInfo',
                required: false,
            },
        },
    },
};

/**
 * @private
 */

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
    newEndpointList,
);

module.exports = endpoints;
