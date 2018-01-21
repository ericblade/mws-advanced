const { callEndpoint } = require('./callEndpoint');

/*
[ { Condition: 'NewItem',
    SupplyDetail: '',
    TotalSupplyQuantity: '0',
    FNSKU: 'B000WFVXGI',
    InStockSupplyQuantity: '0',
    ASIN: 'B000WFVXGI',
    SellerSKU: 'ND-X5EF-Z0N1' } ]
*/


/**
 * Return information about the availability of a seller's FBA inventory
 *
 * @param {object} options
 * @param {String[]} options.SellerSkus A list of SKUs for items to get inventory info for
 * @param {Date} options.QueryStartDateTime Date to begin searching at
 * @param {string} options.ResponseGroup 'Basic' = Do not include SupplyDetail, 'Detailed' = Do
 * @param {string} options.MarketplaceId Marketplace ID to search
 *
 * @returns {{ nextToken: string, supplyList: object[] }}
 */
const listInventorySupply = async (options) => {
    const results = await callEndpoint('ListInventorySupply', options);
    return { nextToken: results.NextToken, supplyList: results.InventorySupplyList.member };
};

module.exports = { listInventorySupply };
