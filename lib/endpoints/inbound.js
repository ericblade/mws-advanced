//const path = require('path');

const generateEndpoints = require('./endpoints-utils');

//const scriptName = path.basename(__filename, '.js');
//const categoryName = `${scriptName.charAt(0).toUpperCase()}${scriptName.slice(1)}`;
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

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList
);

module.exports = endpoints;
