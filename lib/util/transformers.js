/**
 * @module transformers
 * More than meets the eye.
 */

/**
 * Force parameter to be an array. If it's already an array, return a copy of the original.
 * If it's not an array, then return it inside an array. Useful for ensuring that things that
 * should always be arrays, are actually always arrays.
 *
 * @param {any} arr - item to force to array
 * @return {array} - copy of array, or an array containing arr
 */
const forceArray = arr => [].concat(arr !== undefined ? arr : []);

/**
 * Test if a string is all upper case
 *
 * @param {string} str string to test
 * @return {boolean} true if string is all UPPERCASE
 */
const isUpperCase = str => typeof str === 'string' && str === str.toUpperCase();

// https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
/**
 * Attempt to relatively intelligently convert any string to camelCase (CamelCase => camelCase)
 *
 * @param {string} - string to convert
 * @returns {string} - camelCase version of string
 */
const camelize = (str) => {
    const ret = str.replace(
        /(?:^\w|[A-Z]|\b\w)/g,
        (letter, index) => (index === 0 ? letter.toLowerCase() : letter.toUpperCase()),
    ).replace(/\s+/g, '');
    return ret;
};

/**
 * Move all contents of a subobject 'key' down one level
 * @param {string} key - key to move
 * @param {object} obj - object to move in
 * @return {object} new object with sub-object contents of 'key' moved one level lower
 */
const subObjUpLevel = (key, obj) => {
    const ret = {
        ...obj,
        ...obj[key],
    };
    delete ret[key];
    return ret;
};

// This is a version of subObjUpLevel that fails tests --
// somehow, on objects that had key, it would work, but on objects that didn't contain
// key, it would create key as undefined.  It's not clear why it would effectively delete
// key if it had already existed, because it should be setting it to undefined.  So, I think there
// may be either a node bug, or something i'm not familiar with in the spec.  I'm leaving this
// here right now for future investigation, I should write a test case for the most basic
// version and query some devs to see if it's a bug.
// const subObjUpLevel = (key, obj) => ({
//     ...obj,
//     ...obj[key],
//     [key]: undefined,
// });

/**
 * Rename obj._ to obj.value, and move contents of obj.$ one level lower
 *
 * @param {object} obj - object to operate on
 * @return {object} transformed object
 */
const objToValueSub = obj => ({
    value: obj._,
    ...obj.$,
});

const transformKey = k => (isUpperCase(k) ? k : camelize(k));

/* eslint-disable no-param-reassign */
const transformObjectKeys = (obj, keyTransformer = transformKey) => {
    if (typeof obj.$ === 'object') {
        if (obj._) {
            obj = objToValueSub(obj);
        } else {
            obj = subObjUpLevel('$', obj);
        }
    }
    const ret = Object.keys(obj).reduce((r, key) => {
        const destKey = keyTransformer(key);
        if (typeof obj[key] === 'object') {
            r[destKey] = transformObjectKeys(obj[key], keyTransformer);
        } else {
            r[destKey] = obj[key];
        }
        return r;
    }, {});
    return ret;
};
/* eslint-enable no-param-reassign */

module.exports = {
    camelize,
    forceArray,
    isUpperCase,
    objToValueSub,
    subObjUpLevel,
    transformObjectKeys,
    transformKey,
};
