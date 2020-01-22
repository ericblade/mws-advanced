const { forceArray } = require('../util/transformers');
const sleep = require('../util/sleep');

// TODO: probably needs to handle nextToken
// TODO: write some tests to more completely test this function's output

const inputParser = (opt) => ({
    MaxResultsPerPage: opt.maxResultsPerPage || opt.MaxResultsPerPage,
    AmazonOrderId: opt.amazonOrderId || opt.AmazonOrderId,
    FinancialEventGroupId: opt.financialEventGroupId || opt.FinancialEventGroupId,
    PostedAfter: opt.postedAfter || opt.PostedAfter,
    PostedBefore: opt.postedBefore || opt.PostedBefore,
});

const outputParser = (out) => {
    const res = out.FinancialEvents;
    // TODO: all-in-all, this parser needs a lot of work.
    // TODO: This call can return a *LOT* of differently named items, and it's difficult to figure out what needs to be forced
    // to Array type.
    try {
        res.ShipmentEventList.ShipmentEvent.ShipmentItemList.ShipmentItem = forceArray(res.ShipmentEventList.ShipmentEvent.ShipmentItemList.ShipmentItem);
    } catch (err) {
        //
    }
    return res;
};

const listFinancialEvents = (api) => api.parseEndpoint(outputParser, inputParser)('ListFinancialEvents');


const listFinancialEventsByNextToken = (api) => api.parseEndpoint(outputParser)('ListFinancialEventsByNextToken');

const listFinancialEventsAll = (api) => async (options = {}) => {
    let results = [];
    const financialEvents = await api.parseEndpoint(outputParser, inputParser)('ListFinancialEvents')(options);
    results = results.concat(financialEvents.result);
    let { nextToken } = financialEvents;
    /* eslint-disable no-await-in-loop */
    while (nextToken) {
        const nextPage = await listFinancialEventsByNextToken(api)({ NextToken: nextToken });
        // eslint-disable-next-line prefer-destructuring
        nextToken = nextPage.nextToken;
        results = results.concat(nextPage.result);
        await sleep(2000);
    }
    /* eslint-enable no-await-in-loop */
    return results;
};


module.exports = {
    listFinancialEvents,
    listFinancialEventsByNextToken,
    listFinancialEventsAll,
};
