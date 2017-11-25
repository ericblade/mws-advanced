const generateEndpoints = require('./endpoints-utils');

const categoryName = 'Products';

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
];

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
);

module.exports = endpoints;
