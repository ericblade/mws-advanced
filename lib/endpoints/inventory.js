const generateEndpoints = require('./endpoints-utils');

const categoryName = 'FulfillmentInventory';

const apiVersion = '2010-10-01';

const endpointList = [
    'ListInventorySupply',
    'ListInventorySupplyByNextToken',
    'GetServiceStatus',
];

const newEndpointList = {
    ListInventorySupply: {
        throttle: {
            maxInFlight: 30,
            restoreRate: 120,
        },
        params: {
            SellerSkus: {
                type: 'xs:string',
                required: false, // SellerSkus or QueryStartDateTime true
                list: 'SellerSkus.member',
            },
            QueryStartDateTime: {
                type: 'xs:dateTime',
                required: false, // SellerSkus or QueryStartDateTime true
            },
            ResponseGroup: {
                type: 'xs:string',
                required: false,
                values: ['Basic', 'Detailed'],
            },
            MarketplaceId: {
                type: 'xs:string',
                required: false,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            InventorySupplyList: {
                type: 'InventorySupply',
                required: false,
            },
        },
    },
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
