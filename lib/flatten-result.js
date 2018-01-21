/* eslint-disable no-restricted-syntax,no-param-reassign,prefer-destructuring */
// TODO: rewrite this to not require all these eslint disables.

// TODO: this is like the 2nd or 3rd major revision of this function, using a single
// recursion function. Could probably use a separate "flattenObject" vs "flattenArray" to make
// it simpler.  Right now, I think it's working 100%, though, so I'm not wanting to
// mess with it again.

/** flattenResult does some recursion. We need to act differently on the initial iteration. */
let recursionCount = 0;
/** determine if flattenResult was called with an Array as the root */
let rootWasArray = false;

/**
 * Given an object with arrays inside, reduce any single-length arrays to an object.
 * This is used because the XML output is an array for *everything*, and most of the time you
 * don't want an array for things that will never contain more than one item.
 * If the root of the object is an array, make it an array at the end.
 *
 * This is an attempt to make XML a bit more palatable when converted to JSON.
 * @private
 * @param {any} result
 * @returns same as input, but with single-element arrays reduced to an object
 */

const flattenResult = (result) => {
    // console.warn('**** flattenResult', result);
    // console.warn('* recursionCount=', recursionCount);
    if (recursionCount === 0 && !rootWasArray && Array.isArray(result)) {
        rootWasArray = true;
    }
    recursionCount += 1;
    for (const r in result) {
        // console.warn('**** r=', r);
        if (recursionCount === 0 && Array.isArray(result[r])) {
            result[r] = flattenResult(result[r]);
        } else if (Array.isArray(result[r]) && result[r].length === 1) {
            // console.warn('**** r is single element array');
            result[r] = result[r][0];
        }

        if (typeof result[r] === 'object') {
            // console.warn('**** r is object');
            result[r] = flattenResult(result[r]);
        }
    }
    // console.warn('**** returning ', result);
    if (recursionCount === 0 && rootWasArray === true && !Array.isArray(result)) {
        console.warn('rootWasArray true, result before making array=', result);
        result = [result];
    }
    recursionCount -= 1;
    if (recursionCount === 0) {
        rootWasArray = false;
    }
    return result;
};
/* eslint-enable no-restricted-syntax,no-param-reassign,prefer-destructuring */

// TODO: flattenResult should NOT be called from requestPromise() on the entire root, but
// SHOULD be called from the individual functions that dig out what to return. I think.

module.exports = {
    flattenResult,
};
