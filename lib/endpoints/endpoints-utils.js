// if you ever need to have differing versions on some endpoints, override it after you call
/**
 * Generates internal endpoint data. See files in lib/endpoints for details
 *
 * @private
 * @param {any} categoryName
 * @param {any} version
 * @param {any} endpoints
 * @param {any} endpointDetails
 * @returns
 */
const generateEndpoints = (categoryName, version, endpoints, endpointDetails) => {
    const ret = endpoints.reduce((acc, endpoint) => {
        let index = endpoint;
        if (acc[endpoint]) { // TODO: Code coverage is not hitting this if. Is this worrying about a problem with each category having GetServiceStatus, that doesn't exist? need to test GetServiceStatus everywhere I guess, and see if this if is necessary.
            index = `${categoryName}/${endpoint}`;
        }
        const d = (endpointDetails && endpointDetails[endpoint]) || {};

        const { params, returns, throttle } = d;

        acc[index] = {
            category: categoryName,
            version,
            action: endpoint,
            params,
            returns,
            throttle,
        };
        return acc;
    }, {});
    return ret;
};

module.exports = generateEndpoints;
