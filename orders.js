const path = require('path');

const generateEndpoints = require('./endpoints');

const scriptName = path.basename(__filename, '.js');
const categoryName = `${scriptName.charAt(0).toUpperCase()}${scriptName.slice(1)}`;

const apiVersion = '2013-09-01';

const endpointList = [
    'ListOrders',
    'ListOrdersByNextToken',
    'GetOrder',
    'ListOrderItems',
    'ListOrderItemsByNextToken',
];

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList
);

module.exports = endpoints;
