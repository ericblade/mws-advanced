const { parseEndpoint2 } = require('./callEndpoint');
const parseMatchingProduct = require('./parsers/matchingProduct');
/**
 * Return a list of products and their attributes, based on a text query and contextId.
 *
 * @param {object} options
 * @param {string} options.marketplaceId - marketplace identifier to search
 * @param {string} options.query - a search string "with the same support as that provided on Amazon marketplace websites"
 * @param {string} [options.queryContextId] - context in which to limit search. Not specified will mean "search everywhere". See https://docs.developer.amazonservices.com/en_UK/products/Products_QueryContextIDs.html
 * @returns {Product[]} - Array of product information
 */
const listMatchingProducts = async (options, callOpt) => {
    const parsedOpt = {
        MarketplaceId: options.marketplaceId,
        Query: options.query,
        QueryContextId: options.queryContextId,
    };
    const results = await parseEndpoint2(parseMatchingProduct)('ListMatchingProducts')(parsedOpt, callOpt);
    // TODO: should put the results of a GetMatchingProductForId call and a ListMatchingProducts
    // call side by side with each other, so we can figure out exactly where they differ. As is,
    // this parser is perfectly capable of handling the parsing, but the output comes out
    // unexpectedly buried a level deep in an array.
    return results[0].results;
};

module.exports = {
    listMatchingProducts,
};
