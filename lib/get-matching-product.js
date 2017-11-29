const { callEndpoint } = require('.');

/*
returns
[ { Identifiers: { MarketplaceASIN: [Object] },
    AttributeSets: { 'ns2:ItemAttributes': [Object] },
    Relationships: '',
    SalesRankings: { SalesRank: [Array] } } ]
*/
const getMatchingProductForId = async (options) => {
    const result = await callEndpoint('GetMatchingProductForId', options);
    if (result.Error) {
        throw new Error(JSON.stringify(result.Error));
    }
    // for a single return, flattenResult will drop this to an object, which is not desireable
    // in this particular case.
    const products = Array.isArray(result) ? result : [result];
    const ret = products.map(p => ({ [`${p.$.Id}`]: p.Products.Product }));
    return ret;
};

module.exports = {
    getMatchingProductForId,
};
