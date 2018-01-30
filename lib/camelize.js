// https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
/**
 * Attempt to relatively intelligently convert any string to camelCase (CamelCase => camelCase)
 *
 * @param {string} - string to convert
 * @returns {string} - camelCase version of string
 */
const camelize = (str) => {
    if (str === str.toUpperCase()) {
        return str;
    }
    const ret = str.replace(
        /(?:^\w|[A-Z]|\b\w)/g,
        (letter, index) => (index === 0 ? letter.toLowerCase() : letter.toUpperCase()),
    ).replace(/\s+/g, '');
    return ret;
};

module.exports = camelize;
