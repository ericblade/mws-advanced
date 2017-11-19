// if you ever need to have differing versions on some endpoints, override it after you call
// generateEndpoints.
const generateEndpoints = (categoryName, version, endpoints, endpointDetails) => {
    const ret = endpoints.reduce((prev, next) => {
        prev[next] = {
            category: categoryName,
            version,
            action: next,
            params: endpointDetails && endpointDetails[next] && endpointDetails[next].params || null,
            returns: endpointDetails && endpointDetails[next] && endpointDetails[next].returns || null,
        };
        return prev;
    }, {});
    return ret;
}

module.exports = generateEndpoints;
