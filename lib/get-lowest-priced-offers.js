const { parseEndpoint } = require('./callEndpoint');

const parseLowestPricedOffers = require('./parsers/lowestPricedOffers');

// TODO: perhaps we should merge ForASIN and ForSKU varities into a single call, with either
// a parameter to say which to get, or intelligent determination based on the contents? ... probably
// better to go with a parameter, since a user could use something that looks like an ASIN as a SKU

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
const getLowestPricedOffersForASIN = async (options) => {
    const results = await parseEndpoint('GetLowestPricedOffersForASIN', options)(parseLowestPricedOffers);
    return results;
};

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

const getLowestPricedOffersForSKU = async (options) => {
    const results = await parseEndpoint('GetLowestPricedOffersForSKU', options)(parseLowestPricedOffers);
    return results;
};

module.exports = { getLowestPricedOffersForASIN, getLowestPricedOffersForSKU };
