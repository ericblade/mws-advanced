const fs = require('fs');
const path = require('path');

const MWS = require('@ericblade/mws-simple').default;
const { Queue, QueueSchedule } = require('./endpoints/Queue');

const errors = require('./errors');
const constants = require('./constants');

const { flattenResult } = require('./util/flatten-result');
const { validateAndTransformParameters } = require('./util/validation');
const { digResponseResult } = require('./util/dig-response-result.js');

// esdoc doesn't handle this line when destructuring for some reason.
const MWS_ENDPOINTS = constants.MWS_ENDPOINTS; // eslint-disable-line prefer-destructuring

// TODO: add Subscriptions and Recommendations categories
const {
    feeds,
    finances,
    inbound,
    inventory,
    outbound,
    merchFulfillment,
    orders,
    products,
    sellers,
    reports,
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

        // argh, binding of functions.
        this.init = this.init.bind(this);
        this.doRequest = this.doRequest.bind(this);
        this.parseEndpoint = this.parseEndpoint.bind(this);
        this.callEndpoint = this.callEndpoint.bind(this);
        this.getInboundGuidanceForASIN = this.getInboundGuidanceForASIN.bind(this);
        this.getInboundGuidanceForSKU = this.getInboundGuidanceForSKU.bind(this);
        this.getMarketplaces = this.getMarketplaces.bind(this);
        this.listOrders = this.listOrders.bind(this);
        this.listOrderItems = this.listOrderItems.bind(this);
        this.getOrder = this.getOrder.bind(this);
        this.listFinancialEvents = this.listFinancialEvents.bind(this);
        this.listFinancialEventsByNextToken = this.listFinancialEventsByNextToken.bind(this);
        this.listFinancialEventsAll = this.listFinancialEventsAll.bind(this);
        this.listInventorySupply = this.listInventorySupply.bind(this);
        this.listMatchingProducts = this.listMatchingProducts.bind(this);
        this.getMatchingProductForId = this.getMatchingProductForId.bind(this);
        this.getLowestPricedOffersForAsin = this.getLowestPricedOffersForAsin.bind(this);
        this.getLowestPricedOffersForSku = this.getLowestPricedOffersForSku.bind(this);
        this.getProductCategoriesForAsins = this.getProductCategoriesForAsins.bind(this);
        this.getProductCategoriesForSkus = this.getProductCategoriesForSkus.bind(this);
        this.getMyFeesEstimate = this.getMyFeesEstimate.bind(this);
        this.requestReport = this.requestReport.bind(this);
        this.getReportRequestList = this.getReportRequestList.bind(this);
        this.getReport = this.getReport.bind(this);
        this.getReportList = this.getReportList.bind(this);
        this.getReportListByNextToken = this.getReportListByNextToken.bind(this);
        this.getReportListAll = this.getReportListAll.bind(this);
        this.requestAndDownloadReport = this.requestAndDownloadReport.bind(this);
        this.manageReportSchedule = this.manageReportSchedule.bind(this);
        this.updateReportAcknowledgements = this.updateReportAcknowledgements.bind(this);
        this.getReportScheduleList = this.getReportScheduleList.bind(this);
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

    async doRequest(requestData, options = {}) {
        try {
            const { result, headers } = await this.mws.request(requestData);
            const ret = options.noFlatten ? result : flattenResult(result);
            ret.headers = headers;
            return ret;
        } catch (err) {
            throw err;
        }
    }

    parseEndpoint(outParser, inParser = (x) => x) {
        return (mwsApiName) => async (callOptions, opt) => outParser(await this.callEndpoint(mwsApiName, inParser(callOptions), opt));
    }

    static parseEndpoint(...args) {
        return staticMws.parseEndpoint(...args);
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
     * @param {object.<string,any>} [apiParams] - named hash object of the parameters to pass to the API
     * @param {string} [apiParams.feedContent] - if calling a function that submits a feed, supply the feed data here
     * @param {any} [apiParams.AnythingElse] - other parameters will be passed through validation and into the API
     * @param {object} [options] - options for callEndpoint
     * @param {boolean} [options.noFlatten] - do not flatten results
     * @param {boolean} [options.returnRaw] - return only the raw data (may or may not be flattened)
     * @param {string} [options.saveRaw] - filename to save raw data to (may or may not be flattened)
     * @param {string} [options.saveParsed] - filename to save final parsed data to (not compatible with returnRaw, since parsing won't happen)
     * @param {int} [options.maxThrottleRetries=2] - maximum number of retries for throttling
     * @returns {any} - Results of the call to MWS
     */
    async callEndpoint(name, apiParams = {}, options = { maxThrottleRetries: 2 }) {
        const endpoint = endpoints[name];
        if (!endpoint) {
            throw new errors.InvalidUsage(`Unknown endpoint name supplied to callEndpoint, ${name}`);
        }

        const newOptions = endpoint.params
            ? validateAndTransformParameters(endpoint.params, apiParams)
            : apiParams;

        const { feedContent, ...newOptionsExclFeed } = newOptions;

        const queryOptions = {
            ...newOptionsExclFeed,
            Action: endpoint.action,
            Version: endpoint.version,
        };

        const params = {
            path: `/${endpoint.category}/${endpoint.version}`,
            query: queryOptions,
            feedContent,
        };

        const queueName = `${this.mws.merchantId}/${endpoint.category}/${endpoint.action}`;
        let q = QueueSchedule.getQueue(queueName);
        if (!q) {
            q = new Queue({
                api: this,
                category: endpoint.category,
                action: endpoint.action,
                maxInFlight: (endpoint.throttle && endpoint.throttle.maxInFlight) || 0,
                restoreRate: (endpoint.throttle && endpoint.throttle.restoreRate) || 0,
            }, () => QueueSchedule.deleteQueue(queueName));
            QueueSchedule.registerQueue(q, queueName);
        }
        // TODO: reduce the size of this try!
        try {
            const result = await q.request(params, { noFlatten: options.noFlatten });
            if (options.saveRaw) {
                fs.writeFileSync(path.join(process.cwd(), options.saveRaw), JSON.stringify(result));
            }
            if (options.returnRaw) {
                return result;
            }
            const digResult = digResponseResult(name, result);
            if (options.saveParsed) {
                fs.writeFileSync(path.join(process.cwd(), options.saveParsed), JSON.stringify(digResult));
            }
            return digResult;
        } catch (error) {
            throw error;
        }
    }

    /* eslint-disable global-require */

    // TODO: fill in documentation for getInboundGuidance*
    /**
     * Call MWS GetInboundGuidanceForASIN, return parsed results
     */
    getInboundGuidanceForASIN(...params) {
        const { getInboundGuidanceForASIN } = require('./helpers/getInboundGuidance');
        return getInboundGuidanceForASIN(this)(...params);
    }

    static getInboundGuidanceForASIN(...params) {
        return staticMws.getInboundGuidanceForASIN(...params);
    }

    getInboundGuidanceForSKU(...params) {
        const { getInboundGuidanceForSKU } = require('./helpers/getInboundGuidance');
        return getInboundGuidanceForSKU(this)(...params);
    }

    static getInboundGuidanceForSKU(...params) {
        return staticMws.getInboundGuidanceForSKU(...params);
    }

    /**
     * Get a list of Marketplaces that the current Seller ID is authorized to operate within.
     * @see {@link https://docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html}
     * @example
     * (async function() {
     *    const result = await mws.getMarketplaces();
     *    console.log(result);
     * })();
     * {
     *    A2EUQ1WTGCTBG2:
     *      {
     *         marketplaceId: 'A2EUQ1WTGCTBG2',
     *         defaultCountryCode: 'CA',
     *         domainName: 'www.amazon.ca',
     *          name: 'Amazon.ca',
     *         defaultCurrencyCode: 'CAD',
     *         defaultLanguageCode: 'en_CA',
     *         sellerId: 'A3...',
     *         hasSellerSuspendedListings: 'No',
     *      },
     *  }
     * @return {Object.<marketplaceId,marketDetail>} Object containing {@link marketDetail} indexed by marketplaceId
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

    static listOrders(...params) {
        return staticMws.listOrders(...params);
    }

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

    static listOrderItems(...params) {
        return staticMws.listOrderItems(...params);
    }

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

    static getOrder(...params) {
        return staticMws.getOrder(...params);
    }

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
        const { listFinancialEvents } = require('./helpers/listFinancialEvents');
        return listFinancialEvents(this)(...params);
    }

    static listFinancialEvents(...params) {
        return staticMws.listFinancialEvents(...params);
    }

    /**
     * Get an API endpoint by next token
     * @param {object} options
     * @param {string} NextToken
     */
    listFinancialEventsByNextToken(...params) {
        const { listFinancialEventsByNextToken: helper } = require('./helpers/listFinancialEvents');
        return helper(this)(...params);
    }

    static listFinancialEventsByNextToken(...params) {
        return staticMws.getByNextToken(...params);
    }

    /**
     * Utility function that calls listFinancialEvents and if a nextToken is retrieved
     * it calls listFinancialEventsByNextToken and combines the results in an array
     * until no nextToken is provided by the call to listFinancialEventsByNextToken.
     *
     * @param {object} options
     * @param {number} options.maxResultsPerPage Maximum number of results to return (1 <=> 100)
     * @param {string} options.amazonOrderId An order number to search for
     * @param {string} options.financialEventGroupId Type of Financial Event to search for
     * @param {Date} options.postedAfter When to search for events after
     * @param {Date} options.postedBefore When to search for events prior to
     * @returns {object}
     */
    listFinancialEventsAll(...params) {
        const { listFinancialEventsAll } = require('./helpers/listFinancialEvents');
        return listFinancialEventsAll(this)(...params);
    }

    static listFinancialEventsAll(...params) {
        return staticMws.listFinancialEventsAll(...params);
    }

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

    static listInventorySupply(...params) {
        return staticMws.listInventorySupply(...params);
    }

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

    static listMatchingProducts(...params) {
        return staticMws.listMatchingProducts(...params);
    }

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

    static getMatchingProductForId(...params) {
        return staticMws.getMatchingProductForId(...params);
    }

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

    static getMyFeesEstimate(...params) {
        return staticMws.getMyFeesEstimate(...params);
    }

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

    static requestReport(...params) {
        return staticMws.requestReport(...params);
    }

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

    static getReportRequestList(...params) {
        return staticMws.getReportRequestList(...params);
    }

    /**
     * Download a specific report identified by the ReportId and return it
     *
     * @async
     * @example mws.getReport({ ReportId: '12660293969017879' });
     *
     * @param {object} options - GetReport options, should contain a [ReportId]
     * @param {string} options.ReportId - Report number from [GetReportList] or [GeneratedReportId] from [GetReportRequestListResult]
     * @returns {(Array|object)} - Contents of the report to return (format may vary WIDELY between different reports generated, see [ReportType](https://docs.developer.amazonservices.com/en_US/reports/Reports_ReportType.html))
     */
    getReport(options) {
        const { getReport: helper } = require('./helpers/reports');
        return helper(this)(options);
    }

    static getReport(...params) {
        return staticMws.getReport(...params);
    }

    /**
     * TODO: write documentation for getReportList
     */
    getReportList(...params) {
        const { getReportList: helper } = require('./helpers/reports');
        return helper(this)(...params);
    }

    static getReportList(...params) {
        return staticMws.getReportList(...params);
    }

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

    static getReportListAll(...params) {
        return staticMws.getReportListAll(...params);
    }

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

    static manageReportSchedule(...params) {
        return staticMws.manageReportSchedule(...params);
    }

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

/**
 * contains {@link MWS_MARKETPLACES}, {@link MARKET_CURRENCY}, {@link MWS_ENDPOINTS}
 * @name constants
 * @memberof MwsAdvanced
 * @typedef {object}
 * @params {object} MWS_MARKETPLACES
 */
MwsAdvanced.constants = constants;
module.exports = MwsAdvanced;
// module.exports.constants = constants;
