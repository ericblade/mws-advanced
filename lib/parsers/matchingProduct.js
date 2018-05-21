const {
    forceArray,
    transformObjectKeys,
    transformAttributeSetKey,
} = require('../util/transformers');

/**
 * @typedef ProductIdentifier
 * @param {string} type - Type of Identifier used (asin, upc, ean, jan, etc)
 * @param {string} id - Product Identifier string
 */

/**
 * Determine the product id. GetMatchingProduct* and ListMatchingProducts return VERY similar
 * results, but GetMatchingProduct includes a list of identifiers as $.IdType and $.Id.
 * ListMatchingProduct does not return those, as you're not requesting a list of Ids.
 *
 * @param {any} product - information about a single product from *MatchingProduct* APIs
 * @returns {ProductIdentifier}
 */
const getIdFromProductList = (productList) => {
    const type = productList.$ ? String(productList.$.IdType).toLowerCase() : undefined;
    const id = productList.$ ? productList.$.Id : undefined;
    return { type, id };
};

/**
 * Parse MWS product info into Product[] (TODO: document Product[], it's quite a large potential result)
 *
 * @param {any} productData MWS product info
 * @returns {Product[]}
 */
const parseMatchingProduct = (productData) => {
    // for a single return, flattenResult will drop this to an object, which is not desireable
    // in this particular case.
    const products = forceArray(productData);
    const ret = products.map((p) => {
        const { type, id } = getIdFromProductList(p);
        if (p.Error) {
            return { Error: p.Error, [`${type}`]: id };
        }
        const transformedResults = forceArray(transformObjectKeys(p.Products.Product, transformAttributeSetKey));
        const results = transformedResults.map((x) => {
            // eslint-disable-next-line no-param-reassign
            if (x.salesRankings.salesRank) x.salesRankings.salesRank = forceArray(x.salesRankings.salesRank);
            return x;
        });
        const val = {
            results,
            idType: type,
            id,
        };
        if (type) {
            val[type] = id;
        }
        return val;
    });
    return ret;
};

module.exports = parseMatchingProduct;
