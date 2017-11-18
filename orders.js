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
    'GetServiceStatus',
];

const newEndpointList = {
    ListOrders: {
        throttle: {
            maxInFlight: 6,
            restoreRate: 60,
        },
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
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            LastUpdatedBefore: {
                type: 'xs:dateTime',
                required: false, // ONE OF: LastUpdatedBefore, CreatedBefore
            },
            CreatedBefore: {
                type: 'xs:dateTime',
                required: false, // ONE OF: LastUpdatedBefore, CreatedBefore
            },
            Orders: {
                type: 'Order',
                required: false,
                list: 'Orders',
            }
        }
    },
    ListOrdersByNextToken: {
        throttle: {
            maxInFlight: 6,
            restoreRate: 60,
        },
        params: {
            NextToken: {
                type: 'xs:string',
                required: true,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            LastUpdatedBefore: {
                type: 'xs:dateTime',
                required: false, // ONE OF: LastUpdatedBefore, CreatedBefore
            },
            CreatedBefore: {
                type: 'xs:dateTime',
                required: false, // ONE OF: LastUpdatedBefore, CreatedBefore
            },
            Orders: {
                type: 'Order',
                required: false,
                list: 'Orders',
            },
        }
    },
    GetOrder: {
        throttle: {
            maxInFlight: 6,
            restoreRate: 60,
        },
        params: {
            AmazonOrderId: {
                type: 'xs:string',
                required: true,
                list: 'AmazonOrderId.Id',
                listMax: 50,
            },
        },
        returns: {
            Orders: {
                type: 'Order',
                required: true,
            }
        }
    },
    ListOrderItems: {
        throttle: {
            maxInFlight: 30,
            restoreRate: 30,
        },
        params: {
            AmazonOrderId: {
                type: 'xs:string',
                required: true,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            AmazonOrderId: { // TODO: we could implement format-specifiers as well, this must be 3-7-7 ..
                type: 'xs:string',
                required: true,
            },
            OrderItems: {
                type: 'OrderItem',
                required: true,
            },
        },
    },
    ListOrderItemsByNextToken: {
        throttle: {
            maxInFlight: 30,
            restoreRate: 30,
        },
        params: {
            NextToken: {
                type: 'xs:string',
                required: true,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            AmazonOrderId: { // TODO: we could implement format-specifiers as well, this must be 3-7-7 ..
                type: 'xs:string',
                required: true,
            },
            OrderItems: {
                type: 'OrderItem',
                required: true,
            },
        }
    },
    GetServiceStatus: {
        throttle: {
            maxInFlight: 2,
            restoreRate: 12,
        },
        params: {
        },
        returns: {
            Status: {
                type: 'xs:string',
                required: true, // TODO: mws docs don't specify which items are required here, assume status would be?
            },
            Timestamp: {
                type: 'xs:dateTime',
                required: true,
            },
            MessageId: {
                type: 'xs:string',
                required: false,
            },
            Messages: {
                type: 'Message',
                required: false,
            },
        }
    },
};

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
    newEndpointList
);

module.exports = endpoints;
