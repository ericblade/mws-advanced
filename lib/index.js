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

    /* eslint-enable global-require */
}

module.exports = MwsAdvanced;
