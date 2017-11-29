// return data['{name}Response']['{name}Result'] as most APIs seem to return from the hierarchy
// before any of the useful data is buried.
const digResponseResult = (name, data) => {
    if (data.ErrorResponse) {
        throw new Error(JSON.stringify(data.ErrorResponse));
    }
    if (data[`${name}Response`]) {
        return data[`${name}Response`][`${name}Result`];
    }
    return data;
};

module.exports = {
    digResponseResult,
};
