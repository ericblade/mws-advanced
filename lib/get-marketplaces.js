const { parseEndpoint2 } = require('./callEndpoint');
const parseMarketplaceData = require('./parsers/marketplaceData');

// TODO: upgrade to call ListMarketplaceParticipationsByNextToken when a NextToken
// response is returned.  This seems unlikely that we'd ever be able to test this in reality, as
// that would require Amazon implement over 100 marketplaces, and we have auth to use all of them.

// FURTHER TODO: how smart can we make our framework? can we handle multiple requests
// to any endpoint that returns a NextToken ?
// EVEN FURTHER TODO: can we handle rate limiting, while we're doing that, and only
// return results when we get all the data?

/**
 * @typedef MarketDetail
 * Object indexed by MarketplaceID
 * @param {string} marketplaceId - id of marketplace. should be same as hash index.
 * @param {string} defaultCountryCode - country code for marketplace (US, CA, etc)
 * @param {string} domainName - domain name used by customers to access this market (amazon.com, .ca, .mx)
 * @param {string} defaultCurrencyCode - currency code (USD, CAD, etc)
 * @param {string} defaultLanguageCode - Language setting (en_US, en_CA, etc)
 * @param {string} sellerId - your seller ID in this marketplace
 * @param {boolean} hasSellerSuspendedListings - true if there are seller suspended listings in this account on this market
 */

/**
 * Call MWS ListMarketplaceParticipations, return parsed results
 * @example
 * const marketplaces = (async () => await mws.getMarketplaces())();
 * (async function() {
 *    const result = await mws.getMarketplaces();
 *    console.log(result);
 * })();
 * @return {MarketDetail}
 */

const getMarketplaces = parseEndpoint2(parseMarketplaceData)('ListMarketplaceParticipations');

module.exports = {
    getMarketplaces,
};
