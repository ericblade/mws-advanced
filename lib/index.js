// https://sellercentral.amazon.com/forums/thread.jspa?threadID=369774&tstart=75

let MWS = require('mws-simple');

const { flattenResult } = require('./flatten-result');

// TODO: add Subscriptions and Recommendations categories
const {
    feeds, finances, inbound, inventory, outbound,
    merchFulfillment, orders, products, sellers, reports,
} = require('./endpoints');

const { validateAndTransformParameters } = require('./validation');
const { digResponseResult } = require('./dig-response-result.js');

/* Monkeypatch mws-simple to accept authToken in it's constructor */
const oldMWS = MWS;

function Client(opts) {
    // force 'new' constructor
    if (!(this instanceof Client)) return new Client(opts);

    this.host = opts.host || 'mws.amazonservices.com';
    this.port = opts.port || 443;

    if (opts.accessKeyId) this.accessKeyId = opts.accessKeyId;
    if (opts.secretAccessKey) this.secretAccessKey = opts.secretAccessKey;
    if (opts.merchantId) this.merchantId = opts.merchantId;
    if (opts.authToken) this.authToken = opts.authToken;
}

Client.prototype = oldMWS.prototype;

MWS = Client;

/* End Monkeypatch for mws-simple constructor */

/* Begin Monkeypatch mws-simple request() to apply the authToken as MWSAuthToken in the query */
const oldRequestFunction = MWS.prototype.request;

function newRequest(requestData, callback) {
    const newRequestData = { ...requestData };
    if (!requestData.query.MWSAuthToken && this.authToken) {
        newRequestData.query.MWSAuthToken = this.authToken;
    }
    return oldRequestFunction.apply(this, [newRequestData, callback]);
}

MWS.prototype.request = newRequest;

/* End Monkeypatch */

// http://s3.amazonaws.com/devo.docs.developer.amazonservices.com/en_US/sellers/Sellers_ListMarketplaceParticipations.html

// take all the categories and flatten them down into a single flat object
// TODO: THIS MAY BE A BAD IDEA CONSIDERING THAT SOME CATEGORIES SHARE SOME ENDPOINT NAMES
// TODO: WE MAY NEED TO COME UP WITH A WAY TO DEAL WITH THAT.
const endpoints = Object.assign(
    {},
    feeds,
    finances,
    inbound,
    inventory,
    merchFulfillment,
    orders,
    outbound,
    products,
    sellers,
    reports,
);

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
    if (mws.authToken) {
        mws.authToken = authToken;
    }
    return mws;
};

module.exports = {
    init,
    callEndpoint,
};
