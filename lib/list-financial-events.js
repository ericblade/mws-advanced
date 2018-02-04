const { callEndpoint } = require('./callEndpoint');
const { forceArray } = require('./util/transformers');

// TODO: probably needs to handle nextToken
// TODO: write some tests to more completely test this function's output

/**
 * https://docs.developer.amazonservices.com/en_UK/finances/Finances_ListFinancialEvents.html
 *
 * @param {object} options
 * @param {number} options.MaxResultsPerPage Maximum number of results to return (1 <=> 100)
 * @param {string} options.AmazonOrderId An order number to search for
 * @param {string} options.FinancialEventGroupId Type of Financial Event to search for
 * @param {Date} options.PostedAfter When to search for events after
 * @param {Date} options.PostedBefore When to search for events prior to
 * @returns {object}
 */
const listFinancialEvents = async (options) => {
    const results = (await callEndpoint('ListFinancialEvents', options)).FinancialEvents;
    // TODO: This call can return a *LOT* of differently named items, and it's difficult to figure out what needs to be forced
    // to Array type.
    try {
        // force ShipmentItems to be an array
        results.ShipmentEventList.ShipmentEvent.ShipmentItemList.ShipmentItem = forceArray(results.ShipmentEventList.ShipmentEvent.ShipmentItemList.ShipmentItem);
    } catch (err) {
        //
    }
    return results;
};

module.exports = { listFinancialEvents };
