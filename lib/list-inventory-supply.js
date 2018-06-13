const { parseEndpoint } = require('./parseEndpoint');

/*
[ { Condition: 'NewItem',
    SupplyDetail: '',
    TotalSupplyQuantity: '0',
    FNSKU: 'B000WFVXGI',
    InStockSupplyQuantity: '0',
    ASIN: 'B000WFVXGI',
    SellerSKU: 'ND-X5EF-Z0N1' } ]
*/

const inputParser = opt => ({
    SellerSkus: opt.sellerSkus || opt.SellerSkus,
    QueryStartDateTime: opt.queryStartDateTime || opt.QueryStartDateTime,
    ResponseGroup: opt.responseGroup || opt.ResponseGroup,
    MarketplaceId: opt.marketplaceId || opt.MarketplaceId,
});

const outputParser = out => ({
    nextToken: out.NextToken,
    supplyList: out.InventorySupplyList ? out.InventorySupplyList.member : undefined,
});

/**
 * Return information about the availability of a seller's FBA inventory
 *
 * @param {object} options
 * @param {String[]} options.sellerSkus A list of SKUs for items to get inventory info for
 * @param {Date} options.queryStartDateTime Date to begin searching at
 * @param {string} options.responseGroup 'Basic' = Do not include SupplyDetail, 'Detailed' = Do
 * @param {string} options.marketplaceId Marketplace ID to search
 *
 * @returns {{ nextToken: string, supplyList: object[] }}
 */
const listInventorySupply = parseEndpoint(outputParser, inputParser)('ListInventorySupply');

module.exports = { listInventorySupply };
