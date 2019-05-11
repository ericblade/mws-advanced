const generateEndpoints = require('./endpoints-utils');

const categoryName = 'Recommendations';

const apiVersion = '2013-04-01';

const endpointList = [
    'GetLastUpdatedTimeForRecommendations',
    'ListRecommendations',
    'ListRecommendationsByNextToken',
    'GetServiceStatus',
];

const newEndpointList = {
    ListRecommendations: {
        throttle: {
            maxInFlight: 8,
            restoreRate: 30,
        },
        params: {
            MarketplaceId: {
                type: 'xs:string',
                required: true,
            },
            RecommendationCategory: {
                type: 'xs:string',
                values: [
                    'Inventory',
                    'Selection',
                    'Pricing',
                    'Fulfillment',
                    'ListingQuality',
                    'GlobalSelling',
                    'Advertising',
                ],
                required: false,
            },
            CategoryQueryList: {
                list: 'CategoryQueryList.CategoryQuery',
                required: false,
                // TODO: This is going to require some pretty serious work to validate, it's
                // TODO: apparently expecting array of objects, sort of???
                // TODO: we may need to implement a "just accept the user string, no validation"
                // TODO: type to handle this if anyone needs it before validation can be upgraded
            },
        },
        // TODO: fill in returns here
    },
};

module.exports = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
    newEndpointList,
);
