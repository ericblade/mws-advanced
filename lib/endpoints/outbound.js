const generateEndpoints = require('./endpoints-utils');

const categoryName = 'FulfillmentOutboundShipment';

const apiVersion = '2010-10-01';

const endpointList = [
    'GetFulfillmentPreview',
    'CreateFulfillmentOrder',
    'UpdateFulfillmentOrder',
    'GetFulfillmentOrder',
    'ListAllFulfillmentOrders',
    'ListAllFulfillmentOrdersByNextToken',
    'GetPackageTrackingDetails',
    'CancelFulfillmentOrder',
    'ListReturnReasonCodes',
    'CreateFulfillmentReturn',
    'GetServiceStatus',
];

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
);

module.exports = endpoints;
