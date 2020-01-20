const parseMatchingProduct = require('../parsers/matchingProduct');

const inputParser = (opt) => ({
    MarketplaceId: opt.marketplaceId || opt.MarketplaceId,
    Query: opt.query || opt.Query,
    QueryContextId: opt.queryContextId || opt.QueryContextId,
});

const outputParser = (out) => parseMatchingProduct(out)[0].results;

const listMatchingProducts = (api) => api.parseEndpoint(outputParser, inputParser)('ListMatchingProducts');

module.exports = listMatchingProducts;
