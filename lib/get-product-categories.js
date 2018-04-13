const { callEndpoint } = require('./callEndpoint');

/**
 * call GetProductCategoriesForASIN for a single asin.
 *
 * @private
 * @param {object} parameters
 * @param {string} parameters.marketplaceId - marketplace identifier to run query on
 * @param {string} parameters.asin - asin to query for
 * @returns Promise that will resolve to { asin: 'ORIGINAL_ASIN', ...productCategories }
 */
const getProductCategoriesForAsin = ({ marketplaceId, asin }) =>
    callEndpoint('GetProductCategoriesForASIN', {
        MarketplaceId: marketplaceId,
        ASIN: asin,
    }).then(res => ({ asin, ...res })).catch(error => Promise.resolve({ asin, error }));

/**
 * same as getProductCategoriesForAsin but by Sku
 *
 * @private
 * @param {object} parameters
 * @param {string} parameters.marketplaceId - marketplace identifier to run query on
 * @param {string} parameters.sellerSku - sku to query for
 * @returns Promise that will resolve to { sku: 'ORIGINAL_SKU', ...productCategories }
 */
const getProductCategoriesForSku = ({ marketplaceId, sellerSku }) =>
    callEndpoint('GetProductCategoriesForSKU', {
        MarketplaceId: marketplaceId,
        SellerSKU: sellerSku,
    }).then(res => ({ sku: sellerSku, ...res })).catch(error => Promise.resolve({ sku: sellerSku, error }));

/**
 * productCategory
 * Product Category Information
 * @param {string} ProductCategoryId - The string or numeric-string category identifier for the category
 * @param {string} ProductCategoryName - The string human readable description of the category
 * @param {productCategory} [Parent] - Parent product category. This will not be present if this category is the root.
 */

/**
 * @typedef productCategoryByAsin
 * Product Category Information, Retrieved by ASIN
 * @param {string} asin - ASIN that this category information belongs to
 * @param {object} [error] - This field is set when a server error is returned, see error.code and error.body for further info. Server Errors may be returned for invalid ASINs or other reasons.
 * @param {productCategory} [Self] - The product category this ASIN belongs to - if not present, may be an invalid ASIN
 */

/**
 * @typedef productCategoryBySku
 * Product Category Information, Retrieved by SKU
 * @param {string} sku - SKU that this category information belongs to
 * @param {object} [error] - This field is set when a server error is returned, see error.code and error.body for further info. Server Errors may be returned for invalid SKUs or other reasons.
 * @param {productCategory} [Self] - The product category that this SKU belongs to - if not present, may be an invalid ASIN
 */

/**
 * return product categories for multiple asins
 *
 * @param {object} parameters
 * @param {string} parameters.marketplaceId - marketplace identifier to run query on
 * @param {string[]} parameters.asins - Array of string ASINs to query for
 * @returns {productCategoryByAsin[]} - Array of product category information
 */
const getProductCategoriesForAsins = ({ marketplaceId, asins }) => {
    const results = asins.map(asin => getProductCategoriesForAsin({ marketplaceId, asin }));
    return Promise.all(results);
};

/**
 * return product categories for multiple asins
 *
 * @param {object} parameters
 * @param {string} parameters.marketplaceId - marketplace identifier to run query on
 * @param {string[]} parameters.skus - Array of string SKUs to query for
 * @returns {productCategoryBySku[]} - Array of product category information
 */
const getProductCategoriesForSkus = ({ marketplaceId, skus }) => {
    const results = skus.map(sku => getProductCategoriesForSku({ marketplaceId, sku }));
    return Promise.all(results);
};

module.exports = {
    getProductCategoriesForAsins,
    getProductCategoriesForSkus,
};
