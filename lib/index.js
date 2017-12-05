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

const init = ({
    accessKeyId,
    secretAccessKey,
    merchantId,
    authToken,
}) => {
    mws = new MWS({
        accessKeyId,
        secretAccessKey,
        merchantId,
        authToken,
    });
    return mws;
};

module.exports = {
    init,
    callEndpoint,
};
