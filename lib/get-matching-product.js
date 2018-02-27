const { callEndpoint } = require('./callEndpoint');
const { forceArray, transformKey, transformObjectKeys } = require('./util/transformers');
const errors = require('./errors');

/**
 * remove a string pattern from a string
 *
 * @param {string} str string to remove pattern from
 * @param {string|regex} pattern pattern to remove
 * @return {string} string with the pattern removed
 */
const removeFromString = str => pattern => str.replace(pattern, '');

/**
 * Special key transformer for transformObjectKeys to strip "ns2:" from the beginning of keys,
 * such as 'ns2:ItemAttributes'
 *
 * @param {any} k
 */
const transformAttributeSetKey = k => transformKey(removeFromString(k)(/^ns2:/));

/**
 * Returns a list of products and their attributes, based on a list of ASIN, GCID, SellerSKU, UPC,
 * EAN, ISBN, or JAN values
 *
 * @param {Object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetMatchingProductForId.html
 * @param {string} options.MarketplaceId Identifier for marketplace (see getMarketplaces)
 * @param {string} options.IdType Type of lookup to perform: ASIN, GCID, SellerSKU, UPC, EAN, ISBN, JAN
 * @param {string[]} options.IdList List of codes to perform lookup on
 * @public
 * @returns {Product[]}
 */
const getMatchingProductForId = async (options) => {
    const result = await callEndpoint('GetMatchingProductForId', options);
    if (result.Error) {
        throw new errors.ServiceError(result.Error.Message);
    }
    // for a single return, flattenResult will drop this to an object, which is not desireable
    // in this particular case.
    const products = forceArray(result);
    const ret = products.map((p) => {
        const type = String(p.$.IdType).toLowerCase();
        if (p.Error) {
            return { Error: p.Error, [`${type}`]: p.$.Id };
        }
        if (p.Products.Product.SalesRankings.SalesRank) {
            // eslint-disable-next-line no-param-reassign
            p.Products.Product.SalesRankings.SalesRank = forceArray(p.Products.Product.SalesRankings.SalesRank);
        }
        return {
            results: forceArray(transformObjectKeys(p.Products.Product, transformAttributeSetKey)),
            // results: p.Products.Product.map(x => {
            //     return {
            //         ...x,
            //         attributeSets: transformObjectKeys(x.AttributeSets, transformAttributeSetKey),
            //     };
            //     // console.warn("**************** x", x);
            //     // return x;
            // }),
            [`${type}`]: p.$.Id,
            idType: type,
            id: p.$.Id,
        };
    });
    return ret;
};

module.exports = {
    getMatchingProductForId,
};
