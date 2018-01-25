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
    const ret = {};
    endpoints.forEach((endpoint) => {
        let index = endpoint;
        if (ret[endpoint]) { // TODO: Code coverage is not hitting this if. Is this worrying about a problem with each category having GetServiceStatus, that doesn't exist? need to test GetServiceStatus everywhere I guess, and see if this if is necessary.
            index = `${categoryName}/${endpoint}`;
        }
        ret[index] = {
            category: categoryName,
            version,
            action: endpoint,
        };
        if (endpointDetails && endpointDetails[endpoint]) {
            const d = endpointDetails[endpoint];
            if (d.params) ret[index].params = d.params;
            if (d.returns) ret[index].returns = d.returns;
            if (d.throttle) ret[index].throttle = d.throttle;
        }
    });
    // console.warn('***** generateEndpoints', JSON.stringify(ret));
    return ret;
};

module.exports = generateEndpoints;
