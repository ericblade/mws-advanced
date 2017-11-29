// if you ever need to have differing versions on some endpoints, override it after you call
// generateEndpoints.
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
            params:
                (endpointDetails && endpointDetails[endpoint] && endpointDetails[endpoint].params)
                || null,
            returns:
                (endpointDetails && endpointDetails[endpoint] && endpointDetails[endpoint].returns)
                || null,
        };
    });
    return ret;
};

module.exports = generateEndpoints;
