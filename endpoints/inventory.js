//const path = require('path');

const generateEndpoints = require('./endpoints-utils');

//const scriptName = path.basename(__filename, '.js');
//const categoryName = `${scriptName.charAt(0).toUpperCase()}${scriptName.slice(1)}`;
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
    endpointList
);

module.exports = endpoints;
