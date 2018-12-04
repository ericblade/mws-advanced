const fs = require('fs');
const path = require('path');

const MWS = require('mws-simple');

const sleep = require('./util/sleep');
const errors = require('./errors');

const { MWS_ENDPOINTS } = require('./constants');
const { flattenResult } = require('./util/flatten-result');
const { validateAndTransformParameters } = require('./util/validation');
const { digResponseResult } = require('./util/dig-response-result.js');

// TODO: add Subscriptions and Recommendations categories
const {
    feeds, finances, inbound, inventory, outbound,
    merchFulfillment, orders, products, sellers, reports,
} = require('./endpoints');

// TODO: THIS MAY BE A BAD IDEA CONSIDERING THAT SOME CATEGORIES SHARE SOME ENDPOINT NAMES
// TODO: WE MAY NEED TO COME UP WITH A WAY TO DEAL WITH THAT.

/** simple flat list of all the endpoints required from individual modules above */
const endpoints = {
    ...feeds,
    ...finances,
    ...inbound,
    ...inventory,
    ...merchFulfillment,
    ...orders,
    ...outbound,
    ...products,
    ...sellers,
    ...reports,
};

/*
 * holds a reference to a MwsAdvanced if you call static init for old-style use,
 * to prevent garbage collection
 */
let staticMws = null;

class MwsAdvanced {
    /**
     * Create a new instance of MWSAdvanced, calling init(), and binding this instance of callEndpoint
     * to this instance of MWSAdvanced.
     *
     * @param {object} rest - passed on to @see {@link #init}
     * @returns {MWSAdvanced} - new instance of MWSAdvanced
     */
    constructor(...args) {
        this.init(...args);
        this.callEndpoint = this.callEndpoint.bind(this);
        return this;
    }

    static init(...args) {
        staticMws = new MwsAdvanced(...args);
        return staticMws.init(...args);
    }

    /**
     * Initialize mws-advanced with your MWS access keys, merchantId, optionally authtoken, host, port
     * If accessKeyId, secretAccessKey, and/or merchantId are not provided, they will be read from
     * the environment variables MWS_ACESS_KEY, MWS_SECRET_ACCESS_KEY, and MWS_MERCHANT_ID respectively
     *
     * @public
     * @example
     * const mws = MWS.init({ region: 'NA', accessKeyId: '1234', secretAccessKey: '2345', merchantId: '1234567890' });
     * const mws = MWS.init({ region: 'EU', accessKeyId, ... });
     * const mws = MWS.init({ authToken: 'qwerty', accessKeyId, ...});
     * const mws = MWS.init({ host: 'alternate-mws-server.com', accessKeyId, ... });
     * @param {object} config Contains your MWS Access Keys/Tokens and options to configure the API
     * @param {string} [config.accessKeyId=process.env.MWS_ACCESS_KEY] Your MWS Access Key
     * @param {string} [config.secretAccessKey=process.env.MWS_SECRET_ACCESS_KEY] Your MWS Secret Access Key
     * @param {string} [config.merchantId=process.env.MWS_MERCHANT_ID] Your MWS Merchant ID
     * @param {string} [config.authToken] If making a call for a third party account, the Auth Token provided
     *                           for the third party account
     * @param {string} [config.region='NA'] One of the Amazon regions as specified in https://docs.developer.amazonservices.com/en_US/dev_guide/DG_Endpoints.html
     * @param {string} [config.host='mws.amazonservices.com'] Set MWS host server name, see https://docs.developer.amazonservices.com/en_US/dev_guide/DG_Endpoints.html
     * @param {number} [config.port=443] Set MWS host port
     * @returns {mws-simple} - The mws-simple instance used to communicate with the API
     */
    init({
        region = 'NA',
        accessKeyId = process.env.MWS_ACCESS_KEY,
        secretAccessKey = process.env.MWS_SECRET_ACCESS_KEY,
        merchantId = process.env.MWS_MERCHANT_ID,
        authToken,
        host = MWS_ENDPOINTS[region] || 'mws.amazonservices.com',
        port,
    } = {}) {
        this.mws = new MWS({
            accessKeyId,
            secretAccessKey,
            merchantId,
            authToken,
            host,
            port,
        });
        return this.mws;
    }

    requestPromise(requestData, options = {}) {
        return new Promise((resolve, reject) => {
            this.mws.request(requestData, (err, result, headers) => {
                if (err) {
                    /* eslint-disable-next-line prefer-promise-reject-errors */
                    reject({ error: err, headers });
                } else {
                    resolve(options.noFlatten ? result : flattenResult(result));
                }
            });
        });
    }

    parseEndpoint(outParser, inParser = x => x) {
        return mwsApiName => async (callOptions, opt) => outParser(await this.callEndpoint(mwsApiName, inParser(callOptions), opt));
    }

    static async callEndpoint(...args) {
        // TODO: throw error if init() not called yet
        return staticMws.callEndpoint(...args);
    }

    /**
     * Call a known endpoint at MWS, returning the raw data from the function. Parameters are
     * transformed and validated according to the rules defined in lib/endpoints
     *
     * @async
     * @public
     * @param {string} name - name of MWS API function to call
     * @param {object} [callOptions] - named hash object of the parameters to pass to the API
     * @param {string} [callOptions.feedContent] - if calling a function that submits a feed, supply the feed data here
     * @param {any} [callOptions....rest] - other parameters will be passed through validation and into the API
     * @param {object} [opt] - options for callEndpoint
     * @param {boolean} [opt.noFlatten] - do not flatten results
     * @param {boolean} [opt.returnRaw] - return only the raw data (may or may not be flattened)
     * @param {string} [opt.saveRaw] - filename to save raw data to (may or may not be flattened)
     * @param {string} [opt.saveParsed] - filename to save final parsed data to (not compatible with returnRaw, since parsing won't happen)
     * @param {int} [opt.maxThrottleRetries=2] - maximum number of retries for throttling
     * @returns {any} - Results of the call to MWS
     */
    async callEndpoint(name, callOptions = {}, opt = { maxThrottleRetries: 2 }) {
        const endpoint = endpoints[name];
        if (!endpoint) {
            throw new errors.InvalidUsage(`Unknown endpoint name supplied to callEndpoint, ${name}`);
        }

        const newOptions = endpoint.params
            ? validateAndTransformParameters(endpoint.params, callOptions)
            : callOptions;

        const { feedContent } = newOptions;
        delete newOptions.feedContent;

        const queryOptions = {
            ...newOptions,
            Action: endpoint.action,
            Version: endpoint.version,
        };

        const params = {
            path: `/${endpoint.category}/${endpoint.version}`,
            query: queryOptions,
            feedContent,
        };

        let throttleRetries = 0;
        // TODO: reduce the size of this try!
        try {
            const result = await this.requestPromise(params, { noFlatten: opt.noFlatten });
            if (opt.saveRaw) {
                fs.writeFileSync(path.join(process.cwd(), opt.saveRaw), JSON.stringify(result));
            }
            if (opt.returnRaw) {
                return result;
            }
            const digResult = digResponseResult(name, result);
            if (opt.saveParsed) {
                fs.writeFileSync(path.join(process.cwd(), opt.saveParsed), JSON.stringify(digResult));
            }
            return digResult;
        } catch (error) {
            // TODO: so, it turns out that the throttle headers don't come through on throttled requests
            // only on the request that was last successful.  so, it seems we need to build a system
            // that actually keeps track of when we last received some throttle headers, and
            // pre-determine if we're about to be throttled, and start doing our own throttling. YAY.
            const {
                error: err,
                /* headers */
            } = error;
            if (err instanceof this.mws.ServerError) {
                if (
                    err.code === 503
                    && opt.maxThrottleRetries > 0
                    && throttleRetries <= opt.maxThrottleRetries
                ) {
                    throttleRetries += 1;
                    console.warn(
                        '***** Error 503 .. throttling?',
                        name,
                        throttleRetries,
                        opt.maxThrottleRetries,
                    );
                    let ms = 2000;
                    if (!endpoint.throttle) {
                        console.warn(`***** throttle information missing for API ${name}`);
                        console.warn('***** ', JSON.stringify(endpoint));
                    } else {
                        // restoreRate = how many you get back in a minute of time. there's an assumption here
                        // that you're spamming a lot of requests if you're hitting throttling, and this
                        // throttle management system is first version, here -- so we're going to throttle it
                        // not to the minimum possible time frame, but to the length of time that it will take
                        // to restore your entire maxInFlight -- assuming you're probably going to hit the max
                        // again as soon as we start letting more requests in.

                        // ultimately, an upgraded version of this throttling handler would keep track of how
                        // many of every request are in flight, and try to throttle it to the minimum amount
                        // of time that you can go, automatically throttling future calls without having to
                        // even encounter the 503 from the server.

                        // that day is not today.  it might be tomorrow. maybe next weekend. i don't know. :-)

                        /* this calculation waits to restore *all* of your possible requests before retrying */
                        // const restoreMaxInFlightMin = (endpoint.throttle.maxInFlight / endpoint.throttle.restoreRate) * (callOptions.IdList ? callOptions.IdList.length : 1);
                        // ms = (restoreMaxInFlightMin * 60 * 1000) + 100;

                        const secondsToRestoreOneRequest = (60 / endpoint.throttle.restoreRate);
                        ms = (secondsToRestoreOneRequest * 1000) + (secondsToRestoreOneRequest * 500);
                    }
                    console.warn(`***** trying again in ${ms}ms`);
                    await sleep(ms + 100);
                    console.warn('**** retrying request', name);
                    return this.callEndpoint(name, callOptions, opt);
                }
            }
            throw err;
        }
    }

    /* eslint-disable global-require */

    /**
     * Call MWS ListMarketplaceParticipations, return parsed results
     * @example
     * const marketplaces = (async () => await mws.getMarketplaces())();
     * (async function() {
     *    const result = await mws.getMarketplaces();
     *    console.log(result);
     * })();
     * @return {MarketDetail}
     */
    getMarketplaces(...params) {
        const helper = require('./helpers/getMarketplaces');
        return helper(this)(...params);
    }

    static getMarketplaces(...params) {
        return staticMws.getMarketplaces(...params);
    }

    /**
     * Return orders created or updated during a specific time frame
     * see https://docs.developer.amazonservices.com/en_UK/orders-2013-09-01/Orders_ListOrders.html
     * At least ONE of the search options (and maybe more depending on which ones you select) must be
     * specified. Error messages may or may not return information on what parameters you are missing.
     * If you are having trouble, see the official parameter documentation above.
     *
     * @param {object} options
     * @param {string[]} options.MarketplaceId Array of Marketplace IDs to search @see {@link MWS_MARKETPLACES}
     * @param {Date} [options.CreatedAfter] Select orders created at or after the given Date
     * @param {Date} [options.CreatedBefore] Select orders created at or before the given Date
     * @param {Date} [options.LastUpdatedAfter] Select orders updated at or after the given Date
     * @param {Date} [options.LastUpdatedBefore] Select orders updated at or before the given Date
     * @param {string} [options.OrderStatus] OrderStatus, see MWS doc page
     * @param {string} [options.FulfillmentChannel] AFN for Amazon fulfillment, MFN for merchant
     * @param {string} [options.PaymentMethod] All, COD, CVS, Other
     * @param {string} [options.BuyerEmail] Search for orders with given Email address
     * @param {string} [options.SellerOrderId] Specified seller order ID
     * @param {string} [options.MaxResultsPerPage=100] Max number of results to return, 1 <=> 100
     * @param {string} [options.TFMShipmentStatus] See MWS doc page
     * @returns {object}
     */
    listOrders(...params) {
        const helper = require('./helpers/listOrders');
        return helper(this)(...params);
    }

    static listOrders(...params) { return staticMws.listOrders(...params); }

    /**
     * Returns order items based on the AmazonOrderId that you specify.
     *
     * If you've pulled a list of orders using @see {@link ListOrders}, or have order identifiers
     * stored in some other fashion, then to find out what items are actually on the orders, you will
     * need to call ListOrderItems to obtain details about the items that were ordered.  The ListOrders
     * call does not give you any information about the items, except how many of them have shipped or
     * not shipped.
     *
     * If an Order is in the Pending state, ListOrderItems will not return any pricing or promotion
     * information. Once an order has left the Pending state, the following items will be returned:
     *
     * ItemTax, GiftWrapPrice, ItemPrice, PromotionDiscount, GiftWrapTax, ShippingTax, ShippingPrice,
     * ShippingDiscount
     *
     * @public
     * @param {string} AmazonOrderId - 3-7-7 Amazon Order ID formatted string
     * @returns {OrderItemList}
     */
    listOrderItems(...params) {
        const helper = require('./helpers/listOrderItems');
        return helper(this)(...params);
    }

    static listOrderItems(...params) { return staticMws.listOrderItems(...params); }

    /**
     * Return orders by ID, i.e. Amazon Order ID.
     * see https://docs.developer.amazonservices.com/en_UK/orders-2013-09-01/Orders_GetOrder.html
     *
     * @param {object} options
     * @param {string[]} options A list of AmazonOrderId values. An AmazonOrderId is an Amazon-defined order identifier, in 3-7-7 format.
     * @returns {object} A list of orders
     */
    getOrder(...params) {
        const helper = require('./helpers/getOrder');
        return helper(this)(...params);
    }

    static getOrder(...params) { return staticMws.getOrder(...params); }

    /**
     * https://docs.developer.amazonservices.com/en_UK/finances/Finances_ListFinancialEvents.html
     *
     * @param {object} options
     * @param {number} options.maxResultsPerPage Maximum number of results to return (1 <=> 100)
     * @param {string} options.amazonOrderId An order number to search for
     * @param {string} options.financialEventGroupId Type of Financial Event to search for
     * @param {Date} options.postedAfter When to search for events after
     * @param {Date} options.postedBefore When to search for events prior to
     * @returns {object}
     */
    listFinancialEvents(...params) {
        const helper = require('./helpers/listFinancialEvents');
        return helper(this)(...params);
    }

    static listFinancialEvents(...params) { return staticMws.listFinancialEvents(...params); }

    /**
     * Return information about the availability of a seller's FBA inventory
     *
     * @param {object} options
     * @param {String[]} options.sellerSkus A list of SKUs for items to get inventory info for
     * @param {Date} options.queryStartDateTime Date to begin searching at
     * @param {string} options.responseGroup 'Basic' = Do not include SupplyDetail, 'Detailed' = Do
     * @param {string} options.marketplaceId Marketplace ID to search
     *
     * @returns {{ nextToken: string, supplyList: object[] }}
     */
    listInventorySupply(...params) {
        const helper = require('./helpers/listInventorySupply');
        return helper(this)(...params);
    }

    static listInventorySupply(...params) { return staticMws.listInventorySupply(...params); }

    /**
     * Return a list of products and their attributes, based on a text query and contextId.
     *
     * @param {object} options
     * @param {string} options.marketplaceId - marketplace identifier to search
     * @param {string} options.query - a search string "with the same support as that provided on Amazon marketplace websites"
     * @param {string} [options.queryContextId] - context in which to limit search. Not specified will mean "search everywhere". See https://docs.developer.amazonservices.com/en_UK/products/Products_QueryContextIDs.html
     * @returns {Product[]} - Array of product information
     */
    listMatchingProducts(...params) {
        const helper = require('./helpers/listMatchingProducts');
        return helper(this)(...params);
    }

    static listMatchingProducts(...params) { return staticMws.listMatchingProducts(...params); }

    /**
     * Returns a list of products and their attributes, based on a list of ASIN, GCID, SellerSKU, UPC,
     * EAN, ISBN, or JAN values
     *
     * @param {Object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetMatchingProductForId.html
     * @param {string} options.marketplaceId Identifier for marketplace (see getMarketplaces)
     * @param {string} options.idType Type of lookup to perform: ASIN, GCID, SellerSKU, UPC, EAN, ISBN, JAN
     * @param {string[]} options.idList List of codes to perform lookup on
     * @public
     * @returns {Product[]}
     */
    getMatchingProductForId(...params) {
        const helper = require('./helpers/getMatchingProduct');
        return helper(this)(...params);
    }

    static getMatchingProductForId(...params) { return staticMws.getMatchingProductForId(...params); }

    /**
     * getLowestPricedOffersForASIN
     *
     * Calls GetLowestPricedOffersForASIN, reformats results, and returns the data
     *
     * @param {object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetLowestPricedOffersForASIN.html
     * @param {string} options.MarketplaceId Marketplace ID to search
     * @param {string} options.ASIN ASIN to search for
     * @param {string} options.ItemCondition Listing Condition: New, Used, Collectible, Refurbished, Club
     *
     * @return {LowestPricedOffers}
     */
    getLowestPricedOffersForAsin(...params) {
        const { getLowestPricedOffersForASIN } = require('./helpers/getLowestPricedOffers');
        return getLowestPricedOffersForASIN(this)(...params);
    }

    static getLowestPricedOffersForAsin(...params) {
        return staticMws.getLowestPricedOffersForAsin(...params);
    }

    /**
     * getLowestPricedOffersForSKU
     *
     * Calls GetLowestPricedOffersForSKU, reformats results, and returns the data
     *
     * @param {object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetLowestPricedOffersForASIN.html
     * @param {string} options.MarketplaceId Marketplace ID to search
     * @param {string} options.SellerSKU SKU to search for
     * @param {string} options.ItemCondition Listing Condition: New, Used, Collectible, Refurbished, Club
     *
     * @return {LowestPricedOffers}
     */
    getLowestPricedOffersForSku(...params) {
        const { getLowestPricedOffersForSKU } = require('./helpers/getLowestPricedOffers');
        return getLowestPricedOffersForSKU(this)(...params);
    }

    static getLowestPricedOffersForSku(...params) {
        return staticMws.getLowestPricedOffersForSKU(...params);
    }

    /**
     * return product categories for multiple asins
     *
     * @param {object} parameters
     * @param {string} parameters.marketplaceId - marketplace identifier to run query on
     * @param {string[]} parameters.asins - Array of string ASINs to query for
     * @returns {productCategoryByAsin[]} - Array of product category information
     */
    getProductCategoriesForAsins(...params) {
        const { getProductCategoriesForAsins } = require('./helpers/getProductCategories');
        return getProductCategoriesForAsins(this)(...params);
    }

    static getProductCategoriesForAsins(...params) {
        return staticMws.getProductCategoriesForAsins(...params);
    }

    /**
     * return product categories for multiple SKUs
     *
     * @param {object} parameters
     * @param {string} parameters.marketplaceId - marketplace identifier to run query on
     * @param {string[]} parameters.skus - Array of string SKUs to query for
     * @returns {productCategoryBySku[]} - Array of product category information
     */
    getProductCategoriesForSkus(...params) {
        const { getProductCategoriesForSkus } = require('./helpers/getProductCategories');
        return getProductCategoriesForSkus(this)(...params);
    }

    static getProductCategoriesForSkus(...params) {
        return staticMws.getProductCategoriesForSkus(...params);
    }

    /**
     * Get an estimate of fees for an item, based on listing and shipping prices.
     *
     * @param {EstimateRequest[]} - Array of EstimateRequest items to get fees for
     * @returns {Object} - Object of Estimate items, indexed by EstimateRequest Identifier
     */
    getMyFeesEstimate(...params) {
        const helper = require('./helpers/getMyFeesEstimate');
        return helper(this)(...params);
    }

    static getMyFeesEstimate(...params) { return staticMws.getMyFeesEstimate(...params); }

    /**
     * Request a report from MWS
     * Many optional parameters may be required by MWS! Read [ReportType](https://docs.developer.amazonservices.com/en_US/reports/Reports_ReportType.html) for specifics!
     *
     * @async
     * @param {object} options
     * @param {string} options.ReportType Type of Report to Request @see {@link REQUEST_REPORT_TYPES}
     * @param {Date} [options.StartDate] Date to start report
     * @param {Date} [options.EndDate] Date to end report at
     * @param {object} [options.ReportOptions] Reports may have additional options available. Please see the [ReportType](https://docs.developer.amazonservices.com/en_US/reports/Reports_ReportType.html) official docs
     * @param {string[]} [MarketplaceId] Array of marketplace IDs to generate reports covering
     * @returns {ReportRequestInfo}
     */
    requestReport(...params) {
        const { requestReport: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static requestReport(...params) { return staticMws.requestReport(...params); }

    /**
     * Returns a list of report requests that you can use to get the ReportRequestId for a report
     * After calling requestReport, you should call this function occasionally to see if/when the report
     * has been processed.
     *
     * @async
     * @param {object} [options] Options to pass to GetReportRequestList
     * @param {string[]} [ReportRequestIdList] List of report request IDs @see {@link requestReport}
     * @param {string[]} [ReportTypeList] List of Report Types @see {@link REQUEST_REPORT_TYPES}
     * @param {string[]} [ReportProcessingStatusList] List of Report Processing
     * Status @see {@link REPORT_PROCESSING_STATUS_TYPES}
     * @param {number} [MaxCount=10] Maximum number of report requests to return, max is 100
     * @param {Date} [RequestedFromDate=90-days-past] Oldest date to search for
     * @param {Date} [RequestedToDate=Now] Newest date to search for
     * @returns {GetReportRequestListResult[]}
     */
    getReportRequestList(...params) {
        const { getReportRequestList: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static getReportRequestList(...params) { return staticMws.getReportRequestList(...params); }

    /**
     * Returns the contents of a report
     * @async
     * @param {object} options Options to pass to GetReport
     * @param {string} options.ReportId Report number
     * from @see {@link GetReportList} or GeneratedReportId from @see {@link GetReportRequestListResult}
     * @return {Array|object} Contents of the report to return (format may vary WIDELY between different reports generated, see [ReportType](https://docs.developer.amazonservices.com/en_US/reports/Reports_ReportType.html))
     */
    getReport(...params) {
        const { getReport: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static getReport(...params) { return staticMws.getReport(...params); }

    /**
     * TODO: write documentation for getReportList
    */
    getReportList(...params) {
        const { getReportList: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static getReportList(...params) { return staticMws.getReportList(...params); }

    /**
     * TODO: write documentation for getReportListByNextToken
     * (or just roll getReportList and getReportListByNextToken into the same wrapper)
     * (that wrapper might be getReportListAll, and just rename it)
     */
    getReportListByNextToken(...params) {
        const { getReportListByNextToken: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static getReportListByNextToken(...params) {
        return staticMws.getReportListByNextToken(...params);
    }

    /**
     * TODO: write documentation for getReportListAll (or see comment on getReportListByNextToken)
    */
    getReportListAll(...params) {
        const { getReportListAll: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static getReportListAll(...params) { return staticMws.getReportListAll(...params); }

    /**
     * TODO: Document requestAndDownloadReport
    */
    requestAndDownloadReport(...params) {
        const { requestAndDownloadReport: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static requestAndDownloadReport(...params) {
        return staticMws.requestAndDownloadReport(...params);
    }

    /**
     * TO DO: WRITE DOCUMENTATION
     */
    manageReportSchedule(...params) {
        const { manageReportSchedule: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static manageReportSchedule(...params) { return staticMws.manageReportSchedule(...params); }

    /**
     * TO DO: WRITE DOCUMENTATION
     */
    updateReportAcknowledgements(...params) {
        const { updateReportAcknowledgements: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static updateReportAcknowledgements(...params) {
        return staticMws.updateReportAcknowledgements(...params);
    }

    /**
     * TO DO: WRITE DOCUMENTATION
     */
    getReportScheduleList(...params) {
        const { getReportScheduleList: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static getReportScheduleList(...params) {
        return staticMws.getReportScheduleList(...params);
    }

    /* eslint-enable global-require */
}

module.exports = MwsAdvanced;
