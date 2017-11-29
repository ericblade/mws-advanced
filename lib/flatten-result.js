// flatten all 1-element arrays found within a result object into just their values
// TODO: rewrite this to not require all these eslint disables.
/* eslint-disable no-restricted-syntax,no-param-reassign,prefer-destructuring */
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

// TODO: rewrite this into proper mocha tests
/*
function testFlattenResult() {
    const test = {
        test: ["test"],
        test2: ["test2", "test2"],
        test3: [
            {
                test4: ["test4"],
            },
        ],
    };
    console.warn(JSON.stringify(test));
    console.warn(flattenResult(test));
}
*/

module.exports = {
    flattenResult,
};
