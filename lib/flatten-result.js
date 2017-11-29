/* eslint-disable no-restricted-syntax,no-param-reassign,prefer-destructuring */
// TODO: rewrite this to not require all these eslint disables.

/**
 * Given an object with arrays inside, reduce any single-length arrays to an object.
 * This is used because the XML output is an array for *everything*, and most of the time you
 * don't want an array for things that will never contain more than one item.
 * @private
 * @param {any} result
 * @returns same as input, but with single-element arrays reduced to an object
 */

const flattenResult = (result) => {
    // console.warn('**** flattenResult', result);
    for (const r in result) {
        // console.warn('**** r=', r);
        if (Array.isArray(result[r]) && result[r].length === 1) {
            // console.warn('**** r is single element array');
            result[r] = result[r][0];
        }
        if (typeof result[r] === 'object') {
            // console.warn('**** r is object');
            result[r] = flattenResult(result[r]);
        }
    }
    // console.warn('**** returning ', result);
    return result;
};
/* eslint-enable no-restricted-syntax,no-param-reassign,prefer-destructuring */

module.exports = {
    flattenResult,
};
