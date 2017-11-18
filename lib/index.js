// https://sellercentral.amazon.com/forums/thread.jspa?threadID=369774&tstart=75

const { promisify } = require('util');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);

let MWS = require('mws-simple');

// TODO: add Subscriptions and Recommendations categories
const {
    feeds, finances, inbound, inventory, outbound,
    merchFulfillment, orders, products, sellers, reports,
} = require('./endpoints');


const { isType, validateAndTransformParameters } = require('./validation');
const sleep = require('./sleep');

/* Monkeypatch mws-simple to accept authToken in it's constructor */
const oldMWS = MWS;

function Client(opts) {

    // force 'new' constructor
    if (!(this instanceof Client)) return new Client(opts);

    this.host = opts.host || 'mws.amazonservices.com';
    this.port = opts.port || 443

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
    if (!requestData.query.MWSAuthToken && this.authToken) {
        requestData.query.MWSAuthToken = this.authToken;
    }
    return oldRequestFunction.apply(this, [requestData, callback]);
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
    products,
    sellers,
    reports
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
        test: ["test"],
        test2: ["test2", "test2"],
        test3: [
            {
                test4: ["test4"],
            },
        ],
    };
    console.warn(JSON.stringify(test));
    console.warn(flattenResult(test));
}

// this will hold the mws reference after init() is called
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
    if (endpoint.params) {
        options = validateAndTransformParameters(endpoint.params, options);
    }
    const queryOptions = {
        ...options,
        Action: endpoint.action,
        Version: endpoint.version,
    };

    const params = {
        path: `/${endpoint.category}/${endpoint.version}`,
        query: queryOptions,
    };

    return await requestPromise(params);
};

const init = ({ accessKeyId, secretAccessKey, merchantId, authToken }) => {
    mws = new MWS({
        accessKeyId,
        secretAccessKey,
        merchantId,
        authToken,
    });
    if (mws.authToken)
        mws.authToken = authToken;
};

module.exports = {
    init,
    callEndpoint,
};
