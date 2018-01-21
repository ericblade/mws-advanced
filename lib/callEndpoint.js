const MWS = require('mws-simple');
const { MWS_ENDPOINTS } = require('./constants');

// TODO: split the "init" function out of the "callEndpoint" file, difficulty: callEndpoint
// depends on having init() modify the mws value, which doesn't carry between module pieces in that
// case -- exporting 'mws' to callEndpoint just results in null every time it's accessed, even
// when requiring it inline in code, rather than at the top of the file. Ugh.  Big design
// problem, that is a holdover from when the entire module was all located in a single file.

/** holds the mws-simple reference after init() is called */
let mws = null;

/**
 * Initialize mws-advanced with your MWS access keys, merchantId, optionally authtoken, host, port
 *
 * @public
 * @param {object} config Contains your MWS Access Keys/Tokens and options to configure the API
 * @param {string} config.accessKeyId Your MWS Access Key
 * @param {string} config.secretAccessKey Your MWS Secret Access Key
 * @param {string} config.merchantId Your MWS Merchant ID
 * @param {string} [config.authToken] If making a call for a third party account, the Auth Token provided
 *                           for the third party account
 * @param {string} [config.region='NA'] One of the Amazon regions as specified in https://docs.developer.amazonservices.com/en_US/dev_guide/DG_Endpoints.html
 * @param {string} [config.host='mws.amazonservices.com'] Set MWS host server name, see https://docs.developer.amazonservices.com/en_US/dev_guide/DG_Endpoints.html
 * @param {number} [config.port=443] Set MWS host port
 * @returns {mws-simple} - The mws-simple instance used to communicate with the API
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

const { flattenResult } = require('./flatten-result');

const { validateAndTransformParameters } = require('./validation');
const { digResponseResult } = require('./dig-response-result.js');

// TODO: add Subscriptions and Recommendations categories
const {
    feeds, finances, inbound, inventory, outbound,
    merchFulfillment, orders, products, sellers, reports,
} = require('./endpoints');

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

/**
 * Return a promise for making the desired request, flattening the response out to something
 * that will hopefully make a little more sense.
 *
 * @async
 * @private
 * @param {any} requestData
 */
const requestPromise = requestData =>
    new Promise((resolve, reject) => {
        // eslint-disable-next-line global-require
        mws.request(requestData, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const flatResult = flattenResult(result);
                resolve(flatResult);
            }
        });
    });

/**
 * Call a known endpoint at MWS, returning the raw data from the function. Parameters are
 * transformed and validated according to the rules defined in lib/endpoints
 *
 * @async
 * @public
 * @param {string} name - name of MWS API function to call
 * @param {object} options - named hash object of the parameters to pass to the API
 * @returns {any} - Results of the call to MWS
 */
const callEndpoint = async (name, options) => {
    const endpoint = endpoints[name];
    if (!endpoint) {
        throw new Error('No endpoint name supplied to callEndpoint');
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

module.exports = {
    init,
    callEndpoint,
};
