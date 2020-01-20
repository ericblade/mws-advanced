const { forceArray } = require('../util/transformers');

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

module.exports = listFinancialEvents;
