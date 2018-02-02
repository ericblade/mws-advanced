const { callEndpoint } = require('./callEndpoint');
const { transformObjectKeys } = require('./util/transformers');

// TODO: upgrade to call ListMarketplaceParticipationsByNextToken when a NextToken
// response is returned.
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

const getMarketplaces = async () => {
    const result = await callEndpoint('ListMarketplaceParticipations');

    // destructure result2.ListParticipations.Participation to marketParticipationsTemp
    const { ListParticipations: { Participation: marketParticipationsTemp } } = result;
    // destructure result2.ListMarketplaces.Marketplace to marketsTemp
    const { ListMarketplaces: { Marketplace: marketsTemp } } = result;

    const marketDetails = {};

    // market = { MarketplaceId, DefaultCountryCode, DomainName, DefaultCurrencyCode, Name }
    // A2ZV50J4W1RKNI === "sim1.stores.amazon.com", "Non-Amazon"
    // A1MQXOICRS2Z7M === "siprod.stores.amazon.ca", "SI CA Prod Marketplace"
    // A2EUQ1WTGCTBG2 === "www.amazon.ca" "Amazon.ca"
    // ATVPDKIKX0DER === "www.amazon.com" "Amazon.com"
    // Looks like "Non-Amazon" and "SI CA Prod Marketplace" are test markets? maybe?
    marketsTemp.forEach((market) => {
        if (market.MarketplaceId === 'A2ZV50J4W1RKNI' ||
            market.MarketplaceId === 'A1MQXOICRS2Z7M') {
            return;
        }
        marketDetails[market.MarketplaceId] = market;
    });

    // marketParticipation = { MarketplaceId, SellerId, HasSellerSuspendedListings }
    marketParticipationsTemp.forEach((participation) => {
        if (participation.MarketplaceId === 'A2ZV50J4W1RKNI' ||
            participation.MarketplaceId === 'A1MQXOICRS2Z7M') {
            return;
        }
        marketDetails[participation.MarketplaceId] = {
            ...marketDetails[participation.MarketplaceId],
            ...participation,
        };
    });
    return transformObjectKeys(marketDetails);
};

module.exports = {
    getMarketplaces,
};
