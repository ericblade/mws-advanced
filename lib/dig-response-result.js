const errors = require('./errors');

/**
 * Return data.${name}Response.${name}Result if available, otherwise return data
 * Convenience method to avoid having to do that in virtually every single response
 * @private
 * @param {string} name
 * @param {object} data
 * @returns data.${name}Response.${nameResult} or data
 */
const digResponseResult = (name, data) => {
    if (data.ErrorResponse) {
        throw new errors.ServiceError(JSON.stringify(data.ErrorResponse));
    }
    if (data[`${name}Response`]) {
        return data[`${name}Response`][`${name}Result`];
    }
    return data;
};

module.exports = {
    digResponseResult,
};
