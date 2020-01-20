/**
 * resolve Promise in specified number of milliseconds, good for waiting.
 *
 * @private
 * @param {number} ms milliseconds to sleep for
 * @returns {Promise}
 */

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = sleep;
