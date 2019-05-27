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
    GetMatchingProduct: {
        throttle: {
            maxInFlight: 1,
            restoreRate: 1,
        },
        params: {
            // this will cause an error to throw if you attempt to use this function.
            // The official documentation says to use GetMatchingProductForId instead, so we'll
            // just enforce that.
            DEPRECATED_USE_GetMatchingProductForId_INSTEAD: {
                type: 'xs:string',
                required: true,
            },
        },
    },
    GetMatchingProductForId: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 300,
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
            restoreRate: 600,
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
            ItemCondition: {
                type: 'xs:string',
                required: false,
                values: ['Any', 'New', 'Used', 'Collectible', 'Refurbished', 'Club'],
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
    GetLowestOfferListingsForSKU: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 600,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string', // TODO: marketplaceId verification
                required: true,
            },
            SellerSKUList: {
                type: 'xs:string',
                required: true,
                list: 'SellerSKUList.SellerSKU',
            },
            ItemCondition: {
                type: 'xs:string',
                required: false,
                values: ['Any', 'New', 'Used', 'Collectible', 'Refurbished', 'Club'],
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
            restoreRate: 300,
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
    GetLowestPricedOffersForSKU: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 300,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string', // TODO: doc says 'MarketplaceType'
                required: true,
            },
            SellerSKU: {
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
            restoreRate: 600,
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
    GetCompetitivePricingForSKU: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 600,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string',
                required: true,
            },
            SellerSKUList: {
                type: 'xs:string',
                required: true, // TODO: maximum 20 values
                list: 'SellerSKUList.SellerSKU',
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
    GetMyPriceForASIN: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 600,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string',
                required: true,
            },
            ASINList: {
                type: 'xs:string',
                required: true,
                list: 'ASINList.ASIN',
            },
            ItemCondition: {
                type: 'xs:string',
                values: ['New', 'Used', 'Collectible', 'Refurbished', 'Club'],
            },
        },
        returns: {
            Identifiers: {
                type: 'Identifier',
                required: true,
            },
            BuyingPrice: {
                type: 'BuyingPrice',
                required: true,
            },
            RegularPrice: {
                type: 'RegularPrice',
                required: true,
            },
            FulfillmentChannel: {
                type: 'FulfillmentChannel',
                required: true,
            },
            ItemCondition: {
                type: 'ItemCondition',
                required: true,
            },
            ItemSubCondition: {
                type: 'ItemSubCondition',
                required: true,
            },
            SellerId: {
                type: 'SellerId',
                required: true,
            },
            SellerSKU: {
                type: 'SellerSKU',
                required: true,
            },
        },
    },
    GetMyPriceForSKU: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 600,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string',
                required: true,
            },
            SellerSKUList: {
                type: 'xs:string',
                required: true,
                list: 'SellerSKUList.SellerSKU',
            },
            ItemCondition: {
                type: 'xs:string',
                values: ['New', 'Used', 'Collectible', 'Refurbished', 'Club'],
            },
        },
        returns: {
            Identifiers: {
                type: 'Identifier',
                required: true,
            },
            BuyingPrice: {
                type: 'BuyingPrice',
                required: true,
            },
            RegularPrice: {
                type: 'RegularPrice',
                required: true,
            },
            FulfillmentChannel: {
                type: 'FulfillmentChannel',
                required: true,
            },
            ItemCondition: {
                type: 'ItemCondition',
                required: true,
            },
            ItemSubCondition: {
                type: 'ItemSubCondition',
                required: true,
            },
            SellerId: {
                type: 'SellerId',
                required: true,
            },
            SellerSKU: {
                type: 'SellerSKU',
                required: true,
            },
        },
    },
    GetProductCategoriesForASIN: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 12,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string', // TODO: validate marketplaceId
                required: true,
            },
            ASIN: {
                type: 'xs:string',
                required: true,
            },
        },
        returns: {
            // TODO: fill this in
        },
    },
    GetProductCategoriesForSKU: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 12,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string', // TODO: validate marketplaceId
                required: true,
            },
            SellerSKU: {
                type: 'xs:string',
                required: true,
            },
        },
        returns: {
            // TODO: fill this in
        },
    },
    GetServiceStatus: {
        throttle: {
            maxInFlight: 2,
            restoreRate: 0.20,
        },
    },
    ListMatchingProducts: {
        throttle: {
            maxInFlight: 20,
            restoreRate: 12,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string', // TODO: validate marketplaceId
                required: true,
            },
            Query: {
                type: 'xs:string',
                required: true,
            },
            QueryContextId: {
                type: 'xs:string',
                required: false,
            },
        },
        returns: {
            /*
            Product,
            Identifiers,
            AttributeSets,
            Relationships,
            SalesRankings,
            */
        },
    },
    // GetMyFeesEstimate: {
    //     throttle: {
    //         maxInFlight: 20,
    //         restoreRate: 600,
    //     },
    //     params: {
    //         FeesEstimateRequestList: {
    //             // https://docs.developer.amazonservices.com/en_UK/products/Products_Datatypes.html#FeesEstimateRequest
    //             // TODO: we don't support custom objects.
    //             // This looks like
    //             // FeesEstimateRequestList.FeesEstimateRequest.1=
    //             // {
    //             //     IdType: 'ASIN', // type: 'MarketplaceType', values: ['ASIN', 'SellerSKU'],
    //             //     IdValue: 'B002KT3XQM', // type: 'xs:string'
    //             //     IsAmazonFulled: true, // type: 'xs:boolean',
    //             //     Identifier: 'request1', // type: 'xs:string'
    //             //     PriceToEstimateFees: {
    //             //         ListingPrice: {
    //             //             CurrencyCode: 'USD',
    //             //             Amount: '30.00',
    //             //         },
    //             //         Shipping: {
    //             //             CurrencyCode: 'USD',
    //             //             Amount: '3.99',
    //             //         },
    //             //         Points: {
    //             //             PointsNumber: 0,
    //             //         },
    //             //     },
    //             // }
    //             type: 'FeesEstimateRequest',
    //             required: true,
    //         },
    //     },
    //     returns: {

    //     },
    // }
};

/**
 * @private
 */

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
    newEndpointList,
);

module.exports = endpoints;
