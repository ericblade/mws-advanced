const generateEndpoints = require('./endpoints-utils');

const categoryName = 'FulfillmentInventory';

const apiVersion = '2010-10-01';

const endpointList = [
    'ListInventorySupply',
    'ListInventorySupplyByNextToken',
    'GetServiceStatus',
];

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
);

module.exports = endpoints;
