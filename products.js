const path = require('path');

const generateEndpoints = require('./endpoints');

const scriptName = path.basename(__filename, '.js');
const categoryName = `${scriptName.charAt(0).toUpperCase()}${scriptName.slice(1)}`;

const apiVersion = '2011-10-01';

const endpointList = [
    'ListMatchingProducts',
    'GetMatchingProduct',
    'GetMatchingProductForId',
    'GetCompetitivePricingForSKU',
    'GetCompetitivePricingForASIN',
    'GetLowestOfferListingsForSKU',
    'GetLowestOfferListingsForASIN',
    'GetLowestPricedOffersForSKU',
    'GetLowestPricedOffersForASIN',
    'GetMyFeesEstimate',
    'GetMyPriceForSKU',
    'GetMyPriceForASIN',
    'GetProductCategoriesForSKU',
    'GetProductCategoriesForASIN',
    'GetServiceStatus',
]

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList
);
