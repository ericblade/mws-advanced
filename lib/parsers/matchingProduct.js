const {
    forceArray,
    transformObjectKeys,
    transformAttributeSetKey,
} = require('../util/transformers');

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
        const type = String(p.$.IdType).toLowerCase();
        if (p.Error) {
            return { Error: p.Error, [`${type}`]: p.$.Id };
        }
        const transformedResults = forceArray(transformObjectKeys(p.Products.Product, transformAttributeSetKey));
        const results = transformedResults.map((x) => {
            // eslint-disable-next-line no-param-reassign
            if (x.salesRankings.salesRank) x.salesRankings.salesRank = forceArray(x.salesRankings.salesRank);
            return x;
        });
        return {
            results,
            [`${type}`]: p.$.Id,
            idType: type,
            id: p.$.Id,
        };
    });
    return ret;
};

module.exports = parseMatchingProduct;
