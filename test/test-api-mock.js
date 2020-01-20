// TODO: This builds a total mock API, we should be able to mock the mws-simple or something,
// so that we don't have to have a completely different high-level API layer *here* and re-build
// half the functionality of the high-level API.

const fs = require('fs');
const { parseString: xmlParser } = require('xml2js');
const { digResponseResult } = require('../lib/util/dig-response-result');
const { flattenResult } = require('../lib/util/flatten-result');

const {
    feeds, finances, inbound, inventory, outbound,
    merchFulfillment, orders, products, sellers, reports,
} = require('../lib/endpoints');

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
        return mwsApiName => async (callOptions, opt) => {
            // console.warn('* mwsApiName=', mwsApiName);
            const results = await this.callEndpoint(mwsApiName, inParser(callOptions), opt);
            // console.warn('* parseEndpoint results=', results);
            return outParser(results);
        };
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
            xmlParser(mockData, (err, result) => err ? reject(result) : resolve(result));
        }).then((mockDataResults) => {
            const x = flattenResult(mockDataResults);
            const digResult = digResponseResult(name, x);
            return digResult;
        });
    }
};

describe('Mock API Testing', () => {
    // it('getLowestPricedOffersForSKU', () => {
    //     const { getLowestPricedOffersForSKU } = require('../lib/helpers/getLowestPricedOffers');
    //     return getLowestPricedOffersForSKU(new MockAPI())();
    // });
    it('GetInboundGuidanceForASIN', async () => {
        const parser = require('../lib/parsers/inboundGuidance');
        const res = await (new MockAPI().parseEndpoint(parser.parseAnyInboundGuidance)('GetInboundGuidanceForASIN')());
        expect(res).to.be.an('object').that.deep.equals({
            InvalidASINString: { error: 'ErrorString' },
            ValidASINString: {
                guidance: 'InboundGuidanceString',
                reason: 'GuidanceReasonString',
            },
        });
    });
    it('GetInboundGuidanceForSKU', async () => {
        const parser = require('../lib/parsers/inboundGuidance');
        const res = await (new MockAPI().parseEndpoint(parser.parseAnyInboundGuidance)('GetInboundGuidanceForSKU')());
        expect(res).to.be.an('object').that.deep.equals({
            InvalidSKUString: { error: 'ErrorString' },
            ValidSKUString: {
                guidance: 'GuidanceString',
                reason: 'ReasonString',
                asin: 'ValidASINString',
            },
        });
    });
});
