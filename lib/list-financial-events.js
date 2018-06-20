const { parseEndpoint } = require('./parseEndpoint');
const { forceArray } = require('./util/transformers');

// TODO: probably needs to handle nextToken
// TODO: write some tests to more completely test this function's output

const inputParser = opt => ({
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
        res.ShipmentEventList.ShipmentEvent.ShipmentItemList.ShipmentItem =
            forceArray(res.ShipmentEventList.ShipmentEvent.ShipmentItemList.ShipmentItem);
    } catch (err) {
        //
    }
    return res;
};

/**
 * https://docs.developer.amazonservices.com/en_UK/finances/Finances_ListFinancialEvents.html
 *
 * @param {object} options
 * @param {number} options.maxResultsPerPage Maximum number of results to return (1 <=> 100)
 * @param {string} options.amazonOrderId An order number to search for
 * @param {string} options.financialEventGroupId Type of Financial Event to search for
 * @param {Date} options.postedAfter When to search for events after
 * @param {Date} options.postedBefore When to search for events prior to
 * @returns {object}
 */
const listFinancialEvents = parseEndpoint(outputParser, inputParser)('ListFinancialEvents');

module.exports = { listFinancialEvents };
