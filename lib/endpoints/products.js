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
    GetLowestOfferListingsForASIN: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 36000,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string', // TODO: marketplaceId verification
                required: true,
            },
            ASINList: {
                type: 'xs:string',
                required: true,
                list: 'ASINList.ASIN',
            },
        },
        returns: {
            AllOfferListingsConsidered: {
                type: '', // TODO: ??? Documentation is really not clear
                required: false,
            },
            Product: {
                type: 'Product', // TODO: contains product subelements Product.Identifiers and Product.LowestOfferListings
                required: true,
            },
            Identifiers: {
                type: '', // TODO: ??? Documnetation also not clear
                required: false,
            },
            LowestOfferListings: {
                type: '', // TODO: ??????
                required: true,
            },
        },
    },
    GetLowestPricedOffersForASIN: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 200,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string', // TODO: doc says 'MarketplaceType'
                required: true,
            },
            ASIN: {
                type: 'xs:string',
                required: true,
            },
            ItemCondition: {
                type: 'xs:string',
                required: true,
                values: ['New', 'Used', 'Collectible', 'Refurbished', 'Club'],
            },
        },
        returns: {
            Identifier: {
                type: 'Identifier',
                required: true,
            },
            Summary: {
                type: 'Summary',
                required: true,
            },
            Offers: {
                type: 'Offers',
                required: false,
            },
        },
    },
    GetCompetitivePricingForASIN: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 36000,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string',
                required: true,
            },
            ASINList: {
                type: 'xs:string',
                required: true, // TODO: maximum 20 values
                list: 'ASINList.ASIN',
            },
        },
        returns: {
            Product: {
                type: 'Product',
                required: true,
            },
            Identifiers: {
                type: 'Identifier',
                required: true,
            },
            CompetitivePricing: {
                type: 'CompetitivePrice',
                required: true,
            },
            SalesRankings: {
                type: 'SalesRanking',
                required: true,
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
