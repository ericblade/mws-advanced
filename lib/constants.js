// The documentation on these is a little weird -- In the top part, it describes AU and JP as being
// separate regions, but in the bottom part, it describes them as being poart of the "FE" region,
// despite them having differing endpoint addresses.  It's weird, compared to the others. I don't
// see any other references to the "FE" region anywhere, but I may be blind.
// To reduce complexity, I have just made each endpoint have a different region name, so I follow
// the conventions at the top part of the docs at https://docs.developer.amazonservices.com/en_US/dev_guide/DG_Endpoints.html

/**
 * A list of Marketplace IDs hashed by their country code. Access with
 * MwsAdvanced.constants.MWS_MARKETPLACES
 * @constant
 * @memberof MwsAdvanced.constants
 */
const MWS_MARKETPLACES = {
    CA: 'A2EUQ1WTGCTBG2',
    MX: 'A1AM78C64UM0Y8',
    US: 'ATVPDKIKX0DER',
    BR: 'A2Q3Y263D00KWC',
    DE: 'A1PA6795UKMFR9',
    ES: 'A1RKKUPIHCS9HS',
    FR: 'A13V1IB3VIYZZH',
    IT: 'APJ6JRA9NG5V4',
    UK: 'A1F83G8C2ARO7P',
    IN: 'A21TJRUUN4KGV',
    CN: 'AAHKV2X7AFYLW',
    AU: 'A39IBJ37TRP1C6',
    JP: 'A1VC38T7YXB528',
    TR: 'A33AVAJ2PDY3EV',
};

/**
 * A list of the default currency codes for markets, indexed by country code.
 * Calling, for example, getMyFeesEstimate in Canada, using USD will fail with
 * "status":"ClientError",
 * "error":{
 *     "code":"InvalidParameterValue",
 *     "message":"There is an client-side error. Please verify your inputs."
 * }
 * so you need to use CAD when calling getMyFeesEstimate for Canada.
 * Access with MwsAdvanced.constants.MARKET_CURRENCY
 * @constant
 * @memberof MwsAdvanced.constants
 */
const MARKET_CURRENCY = {
    US: 'USD',
    CA: 'CAD',
};

/**
 * A list of hosts you can use with the mws-advanced "host" option, hashed by MWS Region Name.
 * Access with MwsAdvanced.constants.MWS_ENDPOINTS
 * @constant
 * @memberof MwsAdvanced.constants
 */
const MWS_ENDPOINTS = {
    NA: 'mws.amazonservices.com',
    BR: 'mws.amazonservices.com',
    EU: 'mws-eu.amazonservices.com',
    IN: 'mws.amazonservices.in',
    CN: 'mws.amazonservices.com.cn',
    AU: 'mws.amazonservices.com.au',
    JP: 'mws.amazonservices.jp',
};

module.exports = {
    MWS_MARKETPLACES,
    MWS_ENDPOINTS,
    MARKET_CURRENCY,
};
