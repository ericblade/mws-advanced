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

const newEndpointList = {
    ListOrders: {
        params: {
            CreatedAfter: {
                type: 'xs:dateTime',
                required: false, // TODO: Yes, if LastUpdatedAfter is not specified. Specifying both CreatedAfter and LastUpdatedAfter returns an error.
            },
            CreatedBefore: {
                type: 'xs:dateTime',
                required: false, // TODO: Must be later than CreatedAfter
            },
            LastUpdatedAfter: {
                type: 'xs:dateTime',
                required: false, // TODO: Yes, if CreatedAfter is not specified. Specifying both CreatedAfter and LastUpdatedAfter returns an error. If LastUpdatedAfter is specified, then BuyerEmail and SellerOrderId cannot be specified.
            },
            LastUpdatedBefore: {
                type: 'xs:dateTime',
                required: false, // TODO: msut be later than LastUpdatedAfter
            },
            OrderStatus: {
                type: 'xs:string',
                required: false,
                values: [ 'PendingAvailability', 'Pending', 'Unshipped', 'PartiallyShipped',
                            'Shipped', 'InvoiceUnconfirmed', 'Canceled', 'Unfulfillable' ],
                list: 'OrderStatus.Status',
            },
            MarketplaceId: {
                type: 'xs:string',
                required: true,
                list: 'MarketplaceId.Id',
            },
            FulfillmentChannel: {
                type: 'xs:string',
                required: false,
                list: 'FulfillmentChannel.Channel',
            },
            PaymentMethod: {
                type: 'xs:string',
                required: false,
                list: 'PaymentMethod.Method',
            },
            BuyerEmail: {
                type: 'xs:string',
                required: false, // TODO: If BuyerEmail is specified, then FulfillmentChannel, OrderStatus, PaymentMethod, LastUpdatedAfter, LastUpdatedBefore, and SellerOrderId cannot be specified.
            },
            SellerOrderId: {
                type: 'xs:string',
                required: false, // TODO: If SellerOrderId is specified, then FulfillmentChannel, OrderStatus, PaymentMethod, LastUpdatedAfter, LastUpdatedBefore, and BuyerEmail cannot be specified.
            },
            MaxResultsPerPage: {
                type: 'xs:positiveInteger',
                required: false,
            },
            TFMShipmentStatus: { // only available in China market
                type: 'xs:string',
                required: false,
                values: [ 'PendingPickUp', 'LabelCanceled', 'PickedUp', 'AtDestinationFC',
                            'Delivered', 'RejectedByBuyer', 'Undeliverable', 'ReturnedToSeller',
                            'Lost' ],
            },
        },
    },
    GetOrder: {
        params: {
            AmazonOrderId: {
                type: 'xs:string',
                required: true,
                list: 'AmazonOrderId.Id',
                listMax: 50,
            },
        },
    },
};

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
    newEndpointList
);

module.exports = endpoints;
