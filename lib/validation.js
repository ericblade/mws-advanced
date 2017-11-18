const isType = (type, test, definition) => {
    let valid = false;
    switch (type) {
        case 'xs:positiveInteger': {
            const newTest = parseInt(test, 10);
            if (newTest === test) {
                if (test < 1 || test < definition.minValue || (definition.maxValue && test > definition.maxValue)) {
                    throw new Error(`Value ${test} outside of allowed range ${definition.minValue || 1}-${definition.maxValue || 'inf'}`);
                }
                valid = true;
            }
            break;
        }
        case 'xs:nonNegativeInteger': {
            const newTest = parseInt(test, 10);
            if (newTest === test) {
                if (test < 0 || test < definition.minValue || (definition.maxValue && test > definition.maxValue)) {
                    throw new Error(`Value ${test} outside of allowed range ${definition.minValue || 1}-${definition.maxValue || 'inf'}`);
                }
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
    if (valid && definition.values) {
        if (!definition.values.includes(valid)) {
            valid = false;
        }
    }
    return valid;
}

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
    Object.keys(options).map((k) => {
        if (!valid[k]) {
            throw new Error(`Unknown parameter ${k}`);
        }
    });
    // check for required, list, and type (inside and outside of list)
    // transform lists into the expected keys at the MWS side.
    // ie key AmazonOrderId becomes AmazonOrderId.Id.{index}
    Object.keys(valid).map((k) => {
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
            if (!o.every((val, index, arr) => isType(v.type, val, v))) {
                throw new Error(`List ${k} expects type ${v.type}`);
            }
            o.forEach((item, index) => {
                newOptions[`${v.list}.${index + 1}`] = item;
            });
        } else { // if not already handled, then run it through isType
            if (v && o && !isType(v.type, o, v)) {
                throw new Error(`Expected type ${v.type} for ${k}`);
            }
            newOptions[k] = o;
        }
    });
    return newOptions;
}

module.exports = {
    isType,
    validateAndTransformParameters,
};
