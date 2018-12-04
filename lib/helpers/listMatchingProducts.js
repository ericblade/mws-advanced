const { parseEndpoint } = require('../parseEndpoint');
const parseMatchingProduct = require('../parsers/matchingProduct');

const inputParser = opt => ({
    MarketplaceId: opt.marketplaceId || opt.MarketplaceId,
    Query: opt.query || opt.Query,
    QueryContextId: opt.queryContextId || opt.QueryContextId,
});

const outputParser = out => parseMatchingProduct(out)[0].results;

/**
 * Return a list of products and their attributes, based on a text query and contextId.
 *
 * @param {object} options
 * @param {string} options.marketplaceId - marketplace identifier to search
 * @param {string} options.query - a search string "with the same support as that provided on Amazon marketplace websites"
 * @param {string} [options.queryContextId] - context in which to limit search. Not specified will mean "search everywhere". See https://docs.developer.amazonservices.com/en_UK/products/Products_QueryContextIDs.html
 * @returns {Product[]} - Array of product information
 */

const listMatchingProducts = parseEndpoint(outputParser, inputParser)('ListMatchingProducts');

module.exports = {
    listMatchingProducts,
};
