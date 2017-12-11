// TODO: testing indicates some weirdness in this call. It throws for things that are outside of
// ranges, but otherwise valid, it throws for things that are not in a list of valid values, but it
// does not throw for basic type incompatibility, relying on it's caller to throw. Should this throw
// on all errors, or should it not throw on any errors? It's a lot easier to determine the *reason*
// for the throw here, so I lean towards fixing this to throw an error for all invalid things. For
// right now, I'm going to leave it exactly as is, because there's always a throw at the end user,
// but this makes unit testing weird.

// we expect xs:dateTime to come in as a ISO string. This is a little confusing because the
// consumer, validateAndTransform allows Date objects as input.

const isType = (type, test, definition) => {
    let valid = false;
    switch (type) {
        case 'xs:positiveInteger':
        case 'xs:nonNegativeInteger': // fallthrough from positiveInteger to nonNegativeInteger intentional
        {
            // TODO: should we add validation that minValue and maxValue are within range as well?
            // or just let consumers of API break it if they want.. :-)
            const newTest = parseInt(test, 10);
            const minValue = (definition && definition.minValue) ||
                (type === 'xs:positiveInteger' && 1) ||
                (type === 'xs:nonNegativeInteger' && 0);
            const maxValue = (definition && definition.maxValue) || undefined;

            if (newTest === test) {
                if (test < minValue || (maxValue && test > maxValue)) {
                    throw new Error(`Value ${test} outside of allowed range ${minValue}-${maxValue || 'inf'}`);
                }
                valid = true;
            }
            break;
        }
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
        throw new Error(`Value ${test} is not in allowed values list: ${definition.values}`);
    }
    return valid;
};

const isValidOrderId = (value, type) => {
    let valid = false;
    switch (type) {
        default:
            console.warn('no valid type passed to isValidOrderId, no checking will be performed.')
            break;
        case 'orderId': {
            const re = new RegExp('\\d{3}-\\d{7}-\\d{7}', 'g');
            if (re.test(value)) {
                valid = true;
            }
        }
    }
    return valid;
};

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
            throw new Error(`Unknown parameter ${k}`);
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
            throw new Error(`Required parameter ${k} missing`);
        }
        // transform Date objects into ISO strings
        if (v.type === 'xs:dateTime' && o instanceof Date) {
            newOptions[k] = o.toISOString();
        } else if (v.list && o) { // transform lists
            if (!Array.isArray(o)) {
                throw new Error(`Parameter ${k} expected an array`);
            }
            if (v.listMax && o.length > v.listMax) {
                throw new Error(`List parameter ${k} can only take up to ${v.listMax} items`);
            }
            if (!o.every(val => isType(v.type, val, v))) {
                throw new Error(`List ${k} expects type ${v.type}`);
            }
            o.forEach((item, index) => {
                newOptions[`${v.list}.${index + 1}`] = item;
            });
        } else { // if not already handled, then run it through isType
            if (v && o && !isType(v.type, o, v)) {
                throw new Error(`Expected type ${v.type} for ${k}`);
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
    isValidOrderId,
    validateAndTransformParameters,
};
