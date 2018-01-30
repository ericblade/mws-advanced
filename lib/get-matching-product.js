const { callEndpoint } = require('./callEndpoint');
const camelize = require('./camelize');

/**
 * Product Information. See official schema for details.
 * http://g-ecx.images-amazon.com/images/G/01/mwsportal/doc/en_US/products/default.xsd and
 * http://g-ecx.images-amazon.com/images/G/01/mwsportal/doc/en_US/products/ProductsAPI_Response.xsd
 * @typedef {Object} Product
 */

/* eslint-disable no-param-reassign, no-return-assign */
/**
 * Takes an amazon AttributeSets object and returns it reformatted
 *
 * @param {object} attributeSets
 * @returns {object} - reformatted Attribute Sets
 */
const parseAttributeSets = (attributeSets) => {
    // move the interior of $ object up one level, if there's no corresponding _ object:
    // { $: { xml:Lang: 'en-US' } } => { xml:Lang: 'en-US' } }
    if (attributeSets.$ && !attributeSets._) {
        // eslint-disable-next-line no-return-assign
        Object.keys(attributeSets.$).forEach(k => attributeSets[k] = attributeSets.$[k]);
        delete attributeSets.$;
    }
    // strip 'ns2:' from beginning of keys, then camelize them, then loop through any subobjects.
    // for _ objects, convert them to "value" and their corresponding "$" contents moves up a level.
    // { _: 1.20, $: { units: 'inches' } } => { value: '1.20', units: 'inches' }
    const result = Object.keys(attributeSets).reduce((ret, key) => {
        const destKey = !(key === key.toUpperCase()) ? camelize(key.replace(/^ns2:/, '')) : key;
        if (typeof attributeSets[key] === 'object') {
            attributeSets[key] = parseAttributeSets(attributeSets[key]);
            if (attributeSets[key]._ && attributeSets[key].$) {
                attributeSets[key] = {
                    value: attributeSets[key]._,
                    ...attributeSets[key].$,
                };
            }
        }
        ret[destKey] = attributeSets[key];
        return ret;
    }, {});
    return result;
};
/* eslint-enable no-param-reassign, no-return-assign */

/**
 * Returns a list of products and their attributes, based on a list of ASIN, GCID, SellerSKU, UPC,
 * EAN, ISBN, or JAN values
 *
 * @param {Object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetMatchingProductForId.html
 * @param {string} options.MarketplaceId Identifier for marketplace (see getMarketplaces)
 * @param {string} options.IdType Type of lookup to perform: ASIN, GCID, SellerSKU, UPC, EAN, ISBN, JAN
 * @param {string[]} options.IdList List of codes to perform lookup on
 * @public
 * @returns {Product[]}
 */
const getMatchingProductForId = async (options) => {
    const result = await callEndpoint('GetMatchingProductForId', options);
    if (result.Error) {
        throw new Error(JSON.stringify(result.Error.Message));
    }
    // for a single return, flattenResult will drop this to an object, which is not desireable
    // in this particular case.
    const products = [].concat(result || []);
    const ret = products.map((p) => {
        const type = String(p.$.IdType).toLowerCase();
        if (p.Error) {
            return { Error: p.Error, [`${type}`]: p.$.Id };
        }
        return {
            ...parseAttributeSets(p.Products.Product),
            [`${type}`]: p.$.Id,
            idType: type,
            id: p.$.Id,
        };
    });
    return ret;
};

module.exports = {
    getMatchingProductForId,
};
