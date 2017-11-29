const { callEndpoint } = require('.');

/*
[ { Condition: 'NewItem',
    SupplyDetail: '',
    TotalSupplyQuantity: '0',
    FNSKU: 'B000WFVXGI',
    InStockSupplyQuantity: '0',
    ASIN: 'B000WFVXGI',
    SellerSKU: 'ND-X5EF-Z0N1' } ]
*/
const listInventorySupply = async (options) => {
    const results = await callEndpoint('ListInventorySupply', options);
    return { nextToken: results.NextToken, supplyList: results.InventorySupplyList.member };
};

module.exports = { listInventorySupply };
