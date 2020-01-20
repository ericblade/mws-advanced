const parseMarketplaceData = require('../parsers/marketplaceData');

// TODO: upgrade to call ListMarketplaceParticipationsByNextToken when a NextToken
// response is returned.  This seems unlikely that we'd ever be able to test this in reality, as
// that would require Amazon implement over 100 marketplaces, and we have auth to use all of them.

// FURTHER TODO: how smart can we make our framework? can we handle multiple requests
// to any endpoint that returns a NextToken ?
// EVEN FURTHER TODO: can we handle rate limiting, while we're doing that, and only
// return results when we get all the data?

const getMarketplaces = (api) => api.parseEndpoint(parseMarketplaceData)('ListMarketplaceParticipations');

module.exports = getMarketplaces;
