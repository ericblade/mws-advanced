const { parseEndpoint } = require('./parseEndpoint');

const parseLowestPricedOffers = require('./parsers/lowestPricedOffers');

// TODO: perhaps we should merge ForASIN and ForSKU varities into a single call, with either
// a parameter to say which to get, or intelligent determination based on the contents? ... probably
// better to go with a parameter, since a user could use something that looks like an ASIN as a SKU

const getLowestPricedOffersBase = parseEndpoint(parseLowestPricedOffers);
/**
 * getLowestPricedOffersForASIN
 *
 * Calls GetLowestPricedOffersForASIN, reformats results, and returns the data
 *
 * @param {object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetLowestPricedOffersForASIN.html
 * @param {string} options.MarketplaceId Marketplace ID to search
 * @param {string} options.ASIN ASIN to search for
 * @param {string} options.ItemCondition Listing Condition: New, Used, Collectible, Refurbished, Club
 *
 * @return {LowestPricedOffers}
 */
const getLowestPricedOffersForASIN = getLowestPricedOffersBase('GetLowestPricedOffersForASIN');

/**
 * getLowestPricedOffersForASIN
 *
 * Calls GetLowestPricedOffersForASIN, reformats results, and returns the data
 *
 * @param {object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetLowestPricedOffersForASIN.html
 * @param {string} options.MarketplaceId Marketplace ID to search
 * @param {string} options.SellerSKU SKU to search for
 * @param {string} options.ItemCondition Listing Condition: New, Used, Collectible, Refurbished, Club
 *
 * @return {LowestPricedOffers}
 */
const getLowestPricedOffersForSKU = getLowestPricedOffersBase('GetLowestPricedOffersForSKU');

module.exports = {
    getLowestPricedOffersForASIN,
    getLowestPricedOffersForSKU,
};
