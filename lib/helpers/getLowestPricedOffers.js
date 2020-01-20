const parseLowestPricedOffers = require('../parsers/lowestPricedOffers');

// TODO: perhaps we should merge ForASIN and ForSKU varities into a single call, with either
// a parameter to say which to get, or intelligent determination based on the contents? ... probably
// better to go with a parameter, since a user could use something that looks like an ASIN as a SKU

const getLowestPricedOffersBase = (api) => api.parseEndpoint(parseLowestPricedOffers);
const getLowestPricedOffersForASIN = (api) => getLowestPricedOffersBase(api)('GetLowestPricedOffersForASIN');
const getLowestPricedOffersForSKU = (api) => getLowestPricedOffersBase(api)('GetLowestPricedOffersForSKU');

module.exports = {
    getLowestPricedOffersForASIN,
    getLowestPricedOffersForSKU,
};
