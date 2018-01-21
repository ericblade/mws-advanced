const generateEndpoints = require('./endpoints-utils');

const categoryName = 'MerchantFulfillment';

const apiVersion = '2015-06-01';

const endpointList = [
    'GetEligibleShippingServices',
    'CreateShipment',
    'GetShipment',
    'CancelShipment',
    'GetServiceStatus',
];

/**
 * @private
 */

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
);

module.exports = endpoints;
