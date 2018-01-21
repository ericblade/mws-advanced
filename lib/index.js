// https://sellercentral.amazon.com/forums/thread.jspa?threadID=369774&tstart=75

const MWS = require('mws-simple');

const { flattenResult } = require('./flatten-result');

// TODO: add Subscriptions and Recommendations categories
const {
    feeds, finances, inbound, inventory, outbound,
    merchFulfillment, orders, products, sellers, reports,
} = require('./endpoints');

const { validateAndTransformParameters } = require('./validation');
const { digResponseResult } = require('./dig-response-result.js');

const { MWS_ENDPOINTS } = require('./constants');

// http://s3.amazonaws.com/devo.docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html

// take all the categories and flatten them down into a single flat object
// TODO: THIS MAY BE A BAD IDEA CONSIDERING THAT SOME CATEGORIES SHARE SOME ENDPOINT NAMES
// TODO: WE MAY NEED TO COME UP WITH A WAY TO DEAL WITH THAT.
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

// this will hold the mws reference after init() is called
let mws = null;

// return a promise for making the desired request, flattening the response out
// to something that makes a little more sense, hopefully.

const requestPromise = requestData =>
    new Promise((resolve, reject) => {
        mws.request(requestData, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const flatResult = flattenResult(result);
                resolve(flatResult);
            }
        });
    });

const callEndpoint = async (name, options) => {
    const endpoint = endpoints[name];
    if (!endpoint) {
        throw new Error(`No endpoint ${name}`);
    }

    const newOptions = endpoint.params ?
        validateAndTransformParameters(endpoint.params, options) : options;

    const queryOptions = {
        ...newOptions,
        Action: endpoint.action,
        Version: endpoint.version,
    };

    const params = {
        path: `/${endpoint.category}/${endpoint.version}`,
        query: queryOptions,
    };

    const result = await requestPromise(params);
    // TODO: add an option that will store the raw data, and a separate option to store the parsed
    // data, to file
    // const fs = require('fs');
    // fs.appendFile(`${name}-out.json`, JSON.stringify(result));
    const digResult = digResponseResult(name, result);
    return digResult;
};
/**
 * Initialize mws-advanced with your MWS access keys, merchantId, optionally authtoken, host, port
 *
 * @param {object} config
 * @param {string} config.accessKeyId Your MWS Access Key
 * @param {string} config.secretAccessKey Your MWS Secret Access Key
 * @param {string} config.merchantId Your MWS Merchant ID
 * @param {string} authToken If making a call for a third party account, the Auth Token provided
 *                           for the third party account
 * @param {string} region (default NA) One of the Amazon regions as specified in https://docs.developer.amazonservices.com/en_US/dev_guide/DG_Endpoints.html
 * @param {string} host default (mws.amazonservices.com) Set MWS host server name, see https://docs.developer.amazonservices.com/en_US/dev_guide/DG_Endpoints.html
 * @param {string} port default (443) Set MWS host port
 * @returns {mws-simple}
 */
const init = ({
    region = 'NA',
    // marketplace = 'US', // TODO: maybe someday we will want to keep track of a 'default' marketplace.
    accessKeyId,
    secretAccessKey,
    merchantId,
    authToken,
    host,
    port,
} = {}) => {
    let newHost = host;
    if (!MWS_ENDPOINTS[region]) {
        console.warn(`**** ${region} not known! Things may not work right or at all. Using default host mws-amazonservices.com`);
    } else if (!newHost) {
        newHost = MWS_ENDPOINTS[region];
    }
    mws = new MWS({
        accessKeyId,
        secretAccessKey,
        merchantId,
        authToken,
        host: newHost,
        port,
    });
    return mws;
};

module.exports = {
    init,
    callEndpoint,
};
