// if you ever need to have differing versions on some endpoints, override it after you call
// generateEndpoints.
const generateEndpoints = (categoryName, version, endpoints) => {
    const ret = endpoints.reduce((prev, next) => {
        prev[next] = {
            category: categoryName,
            version,
            action: next,
        };
        return prev;
    }, {});
    return ret;
}

module.exports = generateEndpoints;