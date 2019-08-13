/**
 * @module validation
 */
const errors = require('../errors');

// TODO: testing indicates some weirdness in this call. It throws for things that are outside of
// ranges, but otherwise valid, it throws for things that are not in a list of valid values, but it
// does not throw for basic type incompatibility, relying on it's caller to throw. Should this throw
// on all errors, or should it not throw on any errors? It's a lot easier to determine the *reason*
// for the throw here, so I lean towards fixing this to throw an error for all invalid things. For
// right now, I'm going to leave it exactly as is, because there's always a throw at the end user,
// but this makes unit testing weird.

// we expect xs:dateTime to come in as a ISO string. This is a little confusing because the
// consumer, validateAndTransform allows Date objects as input.
/* eslint-disable no-param-reassign */

/**
 * validate an integer
 *
 * @memberof validation
 * @param {string} type type of integer to validate (xs:int, xs:positiveInteger, etc)
 * @param {any} test value to test
 * @param {object} minmax minimum and maximum values to test for
 * @param {integer} minmax.minValue minimum value to test for
 * @param {integer} minmax.maxValue maximum value to test for
 * @return {boolean}
 */
const validateInteger = (type, test, { minValue, maxValue } = { }) => {
    if (minValue === undefined) { /* eslint-disable no-nested-ternary */
        minValue = (
            type === 'xs:positiveInteger' ? 1
            : type === 'xs:nonNegativeInteger' ? 0 // eslint-disable-line indent
            : -2147483658 // eslint-disable-line indent
        );
    }
    if (maxValue === undefined) {
        maxValue = 2147483647;
    }
    const newTest = parseInt(test, 10);
    // eslint-disable-next-line eqeqeq
    const valid = test == newTest && (minValue == null || newTest >= minValue) && (maxValue == null || newTest <= maxValue);
    if (!valid) {
        throw new errors.ValidationError(`Expected type ${type} ${minValue} <= ${test} <= ${maxValue}`);
    }
    return valid;
};

/**
 * Tests if an item belongs to a given type, and validates values and other stuff.
 * This function is currently overloaded to do too much. Sorry. The end consumer of *this* function,
 * validateAndTransform, is handling crazier stuff.
 * @param {string} type data type referenced from MWS documentation (ie, 'xs:positiveInteger')
 * @param {any} test data to test against the given type
 * @param {any} definition validation definition (see lib/endpoints)
 * @return {Boolean} true if correct type AND valid, false if not. Throws on many errors.
 */
const isType = (type, test, definition) => {
    let valid = false;
    switch (type) {
        case 'xs:int':
        case 'xs:positiveInteger': // fallthrough from xs:int intentional
        case 'xs:nonNegativeInteger': // fallthrough from xs:positiveInteger intentional
            valid = validateInteger(type, test, definition);
            break;
        case 'xs:string':
            if (typeof test === 'string' || test instanceof String) {
                valid = true;
            }
            break;
        case 'xs:dateTime': // test for exact match to ISO8601
            if (new Date(test).toISOString() === test) {
                valid = true;
            }
            break;
        default:
            console.log(`** isType: dont know how to handle type ${type}, hope its good`);
            valid = true;
    }
    if (valid && definition && definition.values && !definition.values.includes(test)) {
        throw new errors.ValidationError(`Value ${test} is not in allowed values list: ${definition.values}`);
    }
    return valid;
};

/**
 * The "validate" step of "validateAndTransform" will happen here. See discussion here:
 * {@link https://github.com/ericblade/mws-advanced/pull/20}
 *
 * @param {any} test
 * @param {any} definition
 * @return {boolean}
 */
function validate(test, definition) {
    let validOrderId = false;
    const re = /\d{3}-\d{7}-\d{3}/g;
    if (re.test(test) && definition.stringFormat === 'amazonOrderId') {
        validOrderId = true;
    }
    return validOrderId;
}

/**
 * Used to both validate and transform "normal" javascript parameters (such as regular strings,
 * arrays, object hashes, and Date objects) into something that the underlying MWS system can
 * understand.
 *
 * @param {any} valid
 * @param {any} options
 * @return {object}
 */
const validateAndTransformParameters = (valid, options) => {
    if (!options) {
        return {};
    }
    if (!valid) {
        console.warn('**** no validation parameters passed to validateAndTransform, no checking will be performed');
        return options;
    }

    const newOptions = {};
    // check for unknown parameters
    Object.keys(options).forEach((k) => {
        if (!valid[k]) {
            throw new errors.ValidationError(`Unknown parameter ${k}`);
        }
    });
    // check for required, list, and type (inside and outside of list)
    // transform lists into the expected keys at the MWS side.
    // ie key AmazonOrderId becomes AmazonOrderId.Id.{index}
    Object.keys(valid).forEach((k) => {
        const v = valid[k];
        const o = options[k];

        // if required and not found, throw
        if (v.required && !o) {
            throw new errors.ValidationError(`Required parameter ${k} missing`);
        }
        // transform Date objects into ISO strings
        if (v.type === 'xs:dateTime' && o instanceof Date) {
            newOptions[k] = o.toISOString();
        } else if (v.list && o) { // transform lists
            if (!Array.isArray(o)) {
                throw new errors.ValidationError(`Parameter ${k} expected an array`);
            }
            if (v.listMax && o.length > v.listMax) {
                throw new errors.ValidationError(`List parameter ${k} can only take up to ${v.listMax} items`);
            }
            if (!o.every((val) => isType(v.type, val, v))) {
                throw new errors.ValidationError(`List ${k} expects type ${v.type}`);
            }
            o.forEach((item, index) => {
                newOptions[`${v.list}.${index + 1}`] = item;
            });
        } else { // if not already handled, then run it through isType
            if (v && o && !isType(v.type, o, v)) {
                throw new errors.ValidationError(`Expected type ${v.type} for ${k}`);
            }
            if (k && o) {
                newOptions[k] = o;
            }
        }
    });
    return newOptions;
};

module.exports = {
    isType,
    validate,
    validateAndTransformParameters,
};
