const { callEndpoint } = require('.');

// TODO: upgrade to call ListMarketplaceParticipationsByNextToken when a NextToken
// response is returned.
// FURTHER TODO: how smart can we make our framework? can we handle multiple requests
// to any endpoint that returns a NextToken ?
// EVEN FURTHER TODO: can we handle rate limiting, while we're doing that, and only
// return results when we get all the data?

/**
 * Call MWS ListMarketplaceParticipations, return parsed results
 *
 * @return {{ markets: Array, marketParticipations: Array, marketDetail: Object }}
 */

const getMarketplaces = async () => {
    const result = await callEndpoint('ListMarketplaceParticipations');

    // destructure result2.ListParticipations.Participation to marketParticipationsTemp
    const { ListParticipations: { Participation: marketParticipationsTemp } } = result;
    // destructure result2.ListMarketplaces.Marketplace to marketsTemp
    const { ListMarketplaces: { Marketplace: marketsTemp } } = result;

    const marketDetails = {};

    // map and filter
    const markets = marketsTemp.reduce((arr, market) => {
        // market = { MarketplaceId, DefaultCountryCode, DomainName, DefaultCurrencyCode, Name }
        // A2ZV50J4W1RKNI === "sim1.stores.amazon.com", "Non-Amazon"
        // A1MQXOICRS2Z7M === "siprod.stores.amazon.ca", "SI CA Prod Marketplace"
        // A2EUQ1WTGCTBG2 === "www.amazon.ca" "Amazon.ca"
        // ATVPDKIKX0DER === "www.amazon.com" "Amazon.com"
        // Looks like "Non-Amazon" and "SI CA Prod Marketplace" are test markets? maybe?
        if (market.MarketplaceId === 'A2ZV50J4W1RKNI' ||
            market.MarketplaceId === 'A1MQXOICRS2Z7M'
        ) {
            return arr;
        }
        arr.push(market);
        marketDetails[market.MarketplaceId] = market;
        return arr;
    }, []);

    // marketParticipation = { MarketplaceId, SellerId, HasSellerSuspendedListings }
    // map and filter
    const marketParticipations = marketParticipationsTemp.reduce((arr, participation) => {
        if (participation.MarketplaceId === 'A2ZV50J4W1RKNI' ||
            participation.MarketplaceId === 'A1MQXOICRS2Z7M'
        ) {
            return arr;
        }
        arr.push(participation);
        marketDetails[participation.MarketplaceId] = {
            ...marketDetails[participation.MarketplaceId],
            ...participation,
        };
        return arr;
    }, []);

    return { markets, marketParticipations, marketDetails };
};

module.exports = {
    getMarketplaces,
};
