const { callEndpoint } = require('./callEndpoint');
const errors = require('./errors');

const parseMatchingProduct = require('./parsers/matchingProduct');

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
    return parseMatchingProduct(result);
};

module.exports = {
    getMatchingProductForId,
};
