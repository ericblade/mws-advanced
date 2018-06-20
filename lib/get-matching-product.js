const { parseEndpoint } = require('./parseEndpoint');
const errors = require('./errors');

const parseMatchingProduct = require('./parsers/matchingProduct');

const inputParser = opt => ({
    MarketplaceId: opt.marketplaceId || opt.MarketplaceId,
    IdType: opt.idType || opt.IdType,
    IdList: opt.idList || opt.IdList,
});

const outputParser = (out) => {
    if (out.Error) {
        throw new errors.ServiceError(out.Error.Message);
    }
    return parseMatchingProduct(out);
};

/**
 * Returns a list of products and their attributes, based on a list of ASIN, GCID, SellerSKU, UPC,
 * EAN, ISBN, or JAN values
 *
 * @param {Object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetMatchingProductForId.html
 * @param {string} options.marketplaceId Identifier for marketplace (see getMarketplaces)
 * @param {string} options.idType Type of lookup to perform: ASIN, GCID, SellerSKU, UPC, EAN, ISBN, JAN
 * @param {string[]} options.idList List of codes to perform lookup on
 * @public
 * @returns {Product[]}
 */
const getMatchingProductForId =
    parseEndpoint(outputParser, inputParser)('GetMatchingProductForId');

module.exports = {
    getMatchingProductForId,
};
