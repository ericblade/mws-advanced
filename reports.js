const path = require('path');

const generateEndpoints = require('./endpoints');

const scriptName = path.basename(__filename, '.js');
const categoryName = `${scriptName.charAt(0).toUpperCase()}${scriptName.slice(1)}`;

const apiVersion = '2009-01-01';

const endpointList = [
    'RequestReport',
    'GetReportRequestList',
    'GetReport',
    'GetReportList',
    'GetReportListByNextToken',
]

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList
);

module.exports = endpoints;
