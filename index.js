const MWS = require('mws-simple');

const feeds = require('./feeds.js');
const finances = require('./finances.js');
const inbound = require('./inbound.js');
const inventory = require('./inventory.js');
const outbound = require('./outbound.js');
const merchFulfillment = require('./merch-fulfillment.js');
const orders = require('./orders.js');
const products = require('./products.js');
const sellers = require('./sellers.js');

// TODO: implement Recommendations and Reports and Subscriptions
// http://s3.amazonaws.com/devo.docs.developer.amazonservices.com/en_DE/sellers/Sellers_ListMarketplaceParticipations.html

// TODO: probably don't need the "action" part, so long as "action" is always equal to the string
// passed to callEndpoint .. haven't finished looking through the entire API, so might not be?

// TODO: When specifying a "List of" type to Amazon, such as "IdList" to GetMatchingProductForId,
// apparently the API is expecting it to come in such as:
// 'IdList.Id.1': 'Id1',
// 'IdList.Id.2': 'Id2'
// .. The number part starts at 1 (argh!), but how do we determine what the part between the dots
// should be?  Other examples that also work: MarketplaceIdList.Id.1, MarketplaceId.Id.1,
// OrderStatus.Status.1, etc.  Is that something that is dealt with in mws-simple ? or is it some
// part of the Amazon API that I can't seem to find a bit of documentation about?

const endpoints = Object.assign(
    {},
    feeds.endpoints,
    finances.endpoints,
    inbound.endpoints,
    inventory.endpoints,
    merchFulfillment.endpoints,
    orders.endpoints,
    products.endpoints,
    sellers.endpoints
);

// flatten all 1-element arrays found within a result object into just their values
const flattenResult = (result) => {
    // console.warn('**** flattenResult', result);
    for (const r in result) {
        // console.warn('**** r=', r);
        if (Array.isArray(result[r]) && result[r].length === 1) {
            // console.warn('**** r is single element array');
            result[r] = result[r][0];
        }
        if (typeof result[r] === 'object') {
            // console.warn('**** r is object');
            result[r] = flattenResult(result[r]);
        }
    }
    // console.warn('**** returning ', result);
    return result;
}

function testFlattenResult() {
    const test = {
        test: [ "test" ],
        test2: [ "test2", "test2" ],
        test3: [
            {
                test4: [ "test4" ],
            },
        ],
    };
    console.warn(JSON.stringify(test));
    console.warn(flattenResult(test));
}

let mws = null;

// return a promise for making the desired request, flattening the response out
// to something that makes a little more sense, hopefully.

const requestPromise = (requestData) => {
    return new Promise((resolve, reject) => {
        mws.request(requestData, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const flatResult = flattenResult(result)
                resolve(flatResult);
            }
        });
    });
};

const callEndpoint = async (name, options) => {
    const endpoint = endpoints[name];
    if (!endpoint) {
        console.error('**** callEndpoint did not find an endpoint called', name);
        return null;
    }
    const queryOptions = Object.assign({}, options, {
        Action: endpoint.action,
        Version: endpoint.version,
    });

    const params = {
        path: `/${endpoint.category}/${endpoint.version}`,
        query: queryOptions,
    };

    return await requestPromise(params);
};


/*
    returns:
    { markets, marketParticipations }
    markets = MarketplaceId, DefaultCountryCode, DomainName, Name, DefaultCurrencyCode, DefaultLanguageCode
    marketParticipations = MarketplaceId, SellerId, HasSellerSuspendedListings
*/

// TODO: upgrade to call ListMarketplaceParticipationsByNextToken when a NextToken
// response is returned.
// FURTHER TODO: how smart can we make our framework? can we handle multiple requests
// to any endpoint that returns a NextToken ?
// EVEN FURTHER TODO: can we handle rate limiting, while we're doing that, and only
// return results when we get all the data?

const getMarketplaces = async () => {
    const result = await callEndpoint('ListMarketplaceParticipations');
    const result2 = result.ListMarketplaceParticipationsResponse.ListMarketplaceParticipationsResult;
    const marketParticipationsTemp = result2.ListParticipations.Participation;
    const marketsTemp = result2.ListMarketplaces.Marketplace;
    let markets = [];
    let marketParticipations = [];

    for (const m of marketsTemp) {
        if (m.MarketplaceId === 'A2ZV50J4W1RKNI' || m.MarketplaceId === 'A1MQXOICRS2Z7M') {
            continue;
        }
        markets.push(m);
    }

    for (const p of marketParticipationsTemp) {
        p.MarketplaceId = p.MarketplaceId[0];
        p.SellerId = p.SellerId[0];
        p.HasSellerSuspendedListings = p.HasSellerSuspendedListings[0];
        if (p.MarketplaceId !== 'A2ZV50J4W1RKNI' && p.MarketplaceId !== 'A1MQXOICRS2Z7M') {
            marketParticipations.push(p);
        }
    }

    return { markets, marketParticipations };
}

const init = ({ accessKeyId, secretAccessKey, merchantId }) => {
    mws = MWS({
        accessKeyId,
        secretAccessKey,
        merchantId,
    });
};

// see https://docs.developer.amazonservices.com/en_UK/orders-2013-09-01/Orders_ListOrders.html
// returns
/*
    LatestShipDate: [Array], OrderType: [Array], PurchaseDate: [Array], AmazonOrderId: [Array],
    BuyerEmail: [Array], LastUpdateDate: [Array], IsReplacementOrder: [Array], ShipServiceLevel: [Array],
    NumberOfItemsShipped: [Array], OrderStatus: [Array], SalesChannel: [Array], ShippedByAmazonTFM: [Array],
    IsBusinessOrder: [Array], LatestDeliveryDate: [Array], NumberOfItemsUnshipped: [Array],
    PaymentMethodDetails: [Array], BuyerName: [Array], EarliestDeliveryDate: [Array],
    OrderTotal: [Array], IsPremiumOrder: [Array], EarliestShipDate: [Array], MarketplaceId: [Array],
    FulfillmentChannel: [Array], PaymentMethod: [Array], ShippingAddress: [Array],
    IsPrime: [Array], ShipmentServiceLevelCategory: [Array]
*/
// TODO: if provide a NextToken then call ListOrdersByNextToken ?
// TODO: provide an option to automatically call ListOrdersByNextToken if NextToken is received?
const listOrders = async (options) => {
    const results = await callEndpoint('ListOrders', options);
    try {
        return results.ListOrdersResponse.ListOrdersResult.Orders.Order;
    } catch(err) {
        return results;
    }
};

/*
  // http://docs.developer.amazonservices.com/en_US/finances/Finances_Datatypes.html#FinancialEvents
  ProductAdsPaymentEventList: '',
  RentalTransactionEventList: '',
  PayWithAmazonEventList: '',
  ServiceFeeEventList: { ServiceFeeEvent: [ [Object], [Object] ] },
  ServiceProviderCreditEventList: '',
  SellerDealPaymentEventList: '',
  SellerReviewEnrollmentPaymentEventList: '',
  DebtRecoveryEventList: '',
  ShipmentEventList: { ShipmentEvent: [ [Object], [Object], [Object], [Object] ] },
  RetrochargeEventList: '',
  SAFETReimbursementEventList: '',
  GuaranteeClaimEventList: '',
  ChargebackEventList: '',
  FBALiquidationEventList: '',
  LoanServicingEventList: '',
  RefundEventList: '',
  AdjustmentEventList:
   { AdjustmentEvent:
      [ [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object] ] },
  PerformanceBondRefundEventList: ''
*/
const listFinancialEvents = async (options) => {
    const results = await callEndpoint('ListFinancialEvents', options);
    try {
        return results.ListFinancialEventsResponse.ListFinancialEventsResult;
    } catch (err) {
        return results;
    }
}

const listInventorySupply = async (options) => {
    const results = await callEndpoint('ListInventorySupply', options);
    try {
        return results.ListInventorySupplyResponse.ListInventorySupplyResult.InventorySupplyList.member;
    } catch (err) {
        return results;
    }
}

/*
returns
[ { Identifiers: { MarketplaceASIN: [Object] },
    AttributeSets: { 'ns2:ItemAttributes': [Object] },
    Relationships: '',
    SalesRankings: { SalesRank: [Array] } } ]
*/
const getMatchingProductForId = async (options) => {
    let obj = {};
    if (options.IdList) {
        obj = options.IdList.reduce((prev, curr, index) => {
            prev[`IdList.Id.${index+1}`] = curr;
            return prev;
        }, {})
        delete options.IdList;
    }
    obj = Object.assign({}, obj, options);
    const products = await callEndpoint('GetMatchingProductForId', obj);

    try {
        const productList = products.GetMatchingProductForIdResponse.GetMatchingProductForIdResult;
        const ret = productList.map(p => p.Products.Product);
        return ret;
    } catch (err) {
        return products;
    }
}

module.exports = {
    init,
    callEndpoint,
    getMarketplaces,
    listOrders,
    listFinancialEvents,
    listInventorySupply,
    getMatchingProductForId,
};
