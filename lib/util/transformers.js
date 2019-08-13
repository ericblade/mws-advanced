/**
 * @module transformers
 * More than meets the eye.
 */

/**
 * Force parameter to be an array. If it's already an array, return a copy of the original.
 * If it's not an array, then return it inside an array. Useful for ensuring that things that
 * should always be arrays, are actually always arrays.
 *
 * @private
 * @param {any} arr - item to force to array
 * @return {array} - copy of array, or an array containing arr
 */
const forceArray = (arr) => [].concat(arr !== undefined ? arr : []);

/**
 * Test if a string is all upper case. Not a transformer, but used in the key transformer
 *
 * @private
 * @param {string} str string to test
 * @return {boolean} true if string is all UPPERCASE
 */
const isUpperCase = (str) => typeof str === 'string' && str === str.toUpperCase();

// https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
/**
 * Attempt to relatively intelligently convert any string to camelCase (CamelCase => camelCase)
 *
 * @private
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
 *
 * @private
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
 * @private
 * @param {object} obj - object to operate on
 * @return {object} transformed object
 */
const objToValueSub = (obj) => ({
    value: obj._,
    ...obj.$,
});

const transformKey = (k) => (isUpperCase(k) ? k : camelize(k));

/**
 * remove a string pattern from a string
 *
 * @param {string} str string to remove pattern from
 * @param {string|regex} pattern pattern to remove
 * @return {string} string with the pattern removed
 */
const removeFromString = (str, pattern) => str.replace(pattern, '');

/**
 * Special key transformer for transformObjectKeys to strip "ns2:" from the beginning of keys,
 * such as 'ns2:ItemAttributes'
 *
 * @param {any} k
 */
const transformAttributeSetKey = (k) => transformKey(removeFromString(k, /^ns2:/));

/**
 * Transforms an object, and it's keys. Use keyTransformer as a special key transformer function.
 *
 * This is a rather complex function, which takes unintuitive JSON from XML conversion, and attempts
 * to organize it in a more understandable fashion.  It will convert internal objects such as:
 * { "_": "4.20", "$": { "Units": "inches" } }
 * to
 * { "inches": "4.20" }
 *
 * With the application of keyTransformer, you can also convert something like
 * { "ns2:ManufacturerMinimumAge": { "_": "36", "$": { "Units": "months" } } }
 * to a much more readable:
 * { "manufacturerMinimumAge: { "months": "36" } },
 *
 * @param {any} obj
 * @param {any} [keyTransformer=transformKey]
 * @returns transformed object
 */

/* eslint-disable no-param-reassign */
const transformObjectKeys = (obj, keyTransformer = transformKey) => {
    if (!obj) return obj;
    if (typeof obj.$ === 'object') {
        if (obj._) {
            obj = objToValueSub(obj);
        } else {
            obj = subObjUpLevel('$', obj);
        }
    }
    if (Array.isArray(obj)) {
        // map objects in array through this function, otherwise simply return the item
        return obj.map(((x) => (typeof x === 'object' ? transformObjectKeys(x, keyTransformer) : x)));
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

const stringToBool = (str) => (
    str === 'true' ? true : str === 'false' ? false : str // eslint-disable-line no-nested-ternary
);

const stringToFloat = (str) => {
    const i = parseFloat(str);
    return str == i ? i : str; // eslint-disable-line eqeqeq
};

const stringToInt = (str) => {
    const i = parseFloat(str);
    return str >>> 0 === i ? i : str; // eslint-disable-line no-bitwise
};

const stringToPrimitives = (str) => (
    stringToBool(stringToFloat(stringToInt(str)))
);

const transformObjectToPrimitives = (obj) => (
    Object.keys(obj).reduce((acc, key) => {
        acc[key] = stringToPrimitives(obj[key]);
        return acc;
    }, {})
);

/**
 * Returns an object indexed by the given property name,
 * with that property removed, otherwise identical to the original
 */

const objIndexedBy = (obj, name) => {
    const out = { [obj[name]]: { ...obj } };
    delete out[obj[name]][name];
    return out;
};

/**
 * Reduce an Array into a single Object, with each 'name' key of the array objects
 * becoming the index in the array.  ie,
 * [ {asin: '12345', data: { ... }}, { asin: 'abcde', data: { ... } } ]
 * becomes
 * { 12345: { data }, abcde: { data } }
 */
const reduceArrayIntoObjBy = (arr, obj, name) => (
    arr.reduce((acc, next) => {
        acc[next[name]] = { ...next };
        delete acc[next[name]][name];
        return acc;
    }, obj)
);

module.exports = {
    forceArray, // not public, exported for other modules inside this lib
    objIndexedBy,
    reduceArrayIntoObjBy,
    transformObjectKeys,
    transformKey, // not public, but exported for other modules inside this lib to use it
    transformAttributeSetKey,
    transformObjectToPrimitives,
    stringToBool,
    stringToFloat,
    stringToInt,
    stringToPrimitives,
};

if (process.env.NODE_ENV === 'testing') {
    module.exports = {
        ...module.exports,
        camelize,
        isUpperCase,
        objToValueSub,
        removeFromString,
        subObjUpLevel,
    };
}
