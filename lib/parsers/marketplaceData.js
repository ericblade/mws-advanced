const { transformObjectKeys } = require('../util/transformers');

/**
 * Turn a mess of XML from ListMarketplaceParticipations into a @see {@link MarketDetail}
 *
 * @param {any} marketplaceData
 * @returns
 */
const parseMarketplaceData = (marketplaceData) => {
    // destructure result.ListParticipations.Participation to marketParticipationsTemp
    const { ListParticipations: { Participation: marketParticipationsTemp } } = marketplaceData;
    // destructure result.ListMarketplaces.Marketplace to marketsTemp
    const { ListMarketplaces: { Marketplace: marketsTemp } } = marketplaceData;

    let marketDetails = {};

    // market = { MarketplaceId, DefaultCountryCode, DomainName, DefaultCurrencyCode, Name }
    // A2ZV50J4W1RKNI === "sim1.stores.amazon.com", "Non-Amazon"
    // A1MQXOICRS2Z7M === "siprod.stores.amazon.ca", "SI CA Prod Marketplace"
    // A2EUQ1WTGCTBG2 === "www.amazon.ca" "Amazon.ca"
    // ATVPDKIKX0DER === "www.amazon.com" "Amazon.com"
    // Looks like "Non-Amazon" and "SI CA Prod Marketplace" are test markets? maybe?

    const marketFilter = (market) => market !== 'A2ZV50J4W1RKNI' && market !== 'A1MQXOICRS2Z7M';

    marketDetails = marketsTemp.reduce((acc, market) => {
        if (!marketFilter(market.MarketplaceId)) {
            return acc;
        }
        acc[market.MarketplaceId] = market;
        return acc;
    }, marketDetails);

    marketDetails = marketParticipationsTemp.reduce((acc, participation) => {
        if (!marketFilter(participation.MarketplaceId)) {
            return acc;
        }
        acc[participation.MarketplaceId] = {
            ...marketDetails[participation.MarketplaceId],
            ...participation,
        };
        return acc;
    }, marketDetails);

    return transformObjectKeys(marketDetails);
};

module.exports = parseMarketplaceData;
