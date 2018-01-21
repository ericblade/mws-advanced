const { callEndpoint } = require('./callEndpoint');

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
    const results = await callEndpoint('ListFinancialEvents', options);
    return results.FinancialEvents;
};

module.exports = { listFinancialEvents };
