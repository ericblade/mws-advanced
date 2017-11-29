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

const newEndpointList = {
    GetMatchingProductForId: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 18000,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string', // TODO: doc says "MarketplaceType" -- should we validate as that? https://docs.developer.amazonservices.com/en_UK/products/Products_Datatypes.html#MarketplaceType
                required: true,
            },
            IdType: {
                type: 'xs:string',
                required: true,
                values: ['ASIN', 'GCID', 'SellerSKU', 'UPC', 'EAN', 'ISBN', 'JAN'],
            },
            IdList: {
                type: 'xs:string',
                required: true,
                list: 'IdList.Id',
            },
        },
        returns: {
            Product: {
                type: '', // TODO: ?
                required: false,
            },
            Identifiers: {
                type: '', // TODO: ?
                required: false,
            },
            Relationships: {
                type: '', // TODO: ?
                required: false,
            },
            SalesRankings: {
                type: '', // TODO: ?
                required: false,
            },
        },
    },
};

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
    newEndpointList,
);

module.exports = endpoints;
