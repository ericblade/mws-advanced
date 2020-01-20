const errors = require('../errors');

const parseMatchingProduct = require('../parsers/matchingProduct');

const inputParser = (opt) => ({
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

const getMatchingProductForId = (api) => api.parseEndpoint(outputParser, inputParser)('GetMatchingProductForId');

module.exports = getMatchingProductForId;
