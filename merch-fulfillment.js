// const path = require('path');

const generateEndpoints = require('./endpoints');

// const scriptName = path.basename(__filename, '.js');
// const categoryName = `${scriptName.charAt(0).toUpperCase()}${scriptName.slice(1)}`;
const categoryName='MerchantFulfillment';

const apiVersion = '2015-06-01';

const endpointList = [
    'GetEligibleShippingServices',
    'CreateShipment',
    'GetShipment',
    'CancelShipment',
];

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList
);

module.exports = endpoints;
