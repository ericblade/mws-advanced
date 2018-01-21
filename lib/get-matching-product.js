const { callEndpoint } = require('./callEndpoint');

/**
 * Product Information. See official schema for details.
 * http://g-ecx.images-amazon.com/images/G/01/mwsportal/doc/en_US/products/default.xsd and
 * http://g-ecx.images-amazon.com/images/G/01/mwsportal/doc/en_US/products/ProductsAPI_Response.xsd
 * @typedef {Object} Product
 */

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
        throw new Error(JSON.stringify(result.Error.Message));
    }
    // for a single return, flattenResult will drop this to an object, which is not desireable
    // in this particular case.
    const products = Array.isArray(result) ? result : [result];
    const ret = products.map((p) => {
        const type = String(p.$.IdType).toLowerCase();
        if (p.Error) {
            return { Error: p.Error, [`${type}`]: p.$.Id };
        }
        return {
            ...p.Products.Product,
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
