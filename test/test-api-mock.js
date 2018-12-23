
const fs = require('fs');
const { parseString: xmlParser } = require('xml2js');

const {
    feeds, finances, inbound, inventory, outbound,
    merchFulfillment, orders, products, sellers, reports,
} = require('../lib/endpoints');

// TODO: THIS MAY BE A BAD IDEA CONSIDERING THAT SOME CATEGORIES SHARE SOME ENDPOINT NAMES
// TODO: WE MAY NEED TO COME UP WITH A WAY TO DEAL WITH THAT.

/** simple flat list of all the endpoints required from individual modules above */
const endpoints = {
    ...feeds,
    ...finances,
    ...inbound,
    ...inventory,
    ...merchFulfillment,
    ...orders,
    ...outbound,
    ...products,
    ...sellers,
    ...reports,
};

const MOCK_DATA = './test/mock/mws';

const MockAPI = class MockApi {
    parseEndpoint(outParser, inParser = x => x) {
        return mwsApiName => async (callOptions, opt) => outParser(await this.callEndpoint(mwsApiName, inParser(callOptions), opt));
    }

    // TODO: this needs to more accurately mirror what real callEndpoint does
    // re-structuring callEndpoint to allow for injecting a replacement mws-simple
    // is probably the best way to do that. :-S

    /* eslint-disable class-methods-use-this */
    callEndpoint(name/* , callOptions, opt */) {
        const endpoint = endpoints[name];
        // console.warn('* endpoint=', endpoint);
        const mockData = fs.readFileSync(`${MOCK_DATA}/${endpoint.category}/${endpoint.action}Response.xml`);
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line no-confusing-arrow
            xmlParser(mockData, (err, result) => err ? resolve(result) : reject(result));
        });
    }
};

// TODO: this line is only here to prevent pre-commit hook from failing, remove when
// a test works.
module.exports = MockAPI;

// describe.only('Mock API Testing', () => {
//     it('getLowestPricedOffersForSKU', () => {
//         const { getLowestPricedOffersForSKU } = require('../lib/helpers/getLowestPricedOffers');
//         return getLowestPricedOffersForSKU(new MockAPI())();
//     });
// });
