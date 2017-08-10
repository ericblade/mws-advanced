//const path = require('path');

const generateEndpoints = require('./endpoints');

//const scriptName = path.basename(__filename, '.js');
//const categoryName = `${scriptName.charAt(0).toUpperCase()}${scriptName.slice(1)}`;
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
]

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList
);

module.exports = endpoints;
