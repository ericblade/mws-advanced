/* eslint-disable */

const mws = require('..');
const awskeys = require('../test/keys.json');

function getTestDate(daysAgo) {
    const testDate = new Date('01/01/1990');
    // testDate.setDate(testDate.getDate() - );
    return testDate.toISOString();
}

async function testListInventorySupply() {
    const startDate = getTestDate(7);
    const firstResult = await (mws.parseEndpoint(async (supplyRes) => {
        let supply = supplyRes.InventorySupplyList.member;
        console.warn('**** first page of supply');
        // console.warn(JSON.stringify(supply, null, 4));
        let nextToken = supplyRes.NextToken;
        console.warn('**** supply received nextToken=', nextToken);
        // console.warn(JSON.stringify(supply, null, 4));

        // while (nextToken) {
        //     const nextPage = await mws.callEndpoint('ListInventorySupplyByNextToken', {
        //         NextToken: nextToken,
        //     });
        //     console.warn('* nextpage');
        //     // console.warn(JSON.stringify(nextPage, null, 4));
        //     supply = supply.concat(nextPage.InventorySupplyList.member);
        //     nextToken = nextPage.NextToken;
        // }

        console.warn(`**** received ${supply.length} items`);

        let outOfStock = supply.filter(x => parseInt(x.TotalSupplyQuantity, 10) < 1);
        supply = supply.filter(x => parseInt(x.TotalSupplyQuantity, 10) > 0);

        console.warn(`**** potentially available items ${supply.length}`);
        console.warn(`**** out of stock items=${outOfStock.length}`);

        const fs = require('fs');
        fs.writeFileSync('fba.stock.json', JSON.stringify(supply, null, 4));
        fs.writeFileSync('fba.oos.json', JSON.stringify(outOfStock, null, 4));
        return outOfStock;
    })('ListInventorySupply')({
        QueryStartDateTime: startDate,
    }));
    return firstResult;
    // return await mws.listInventorySupply({ QueryStartDateTime: startDate });
}

async function getMyPrice(sku) {
    const res = await mws.callEndpoint('GetMyPriceForSKU', {
        MarketplaceId: 'ATVPDKIKX0DER',
        SellerSKUList: [sku],
    });
    return res;
}

async function main(keys) {
    mws.init(keys);
    const result = await testListInventorySupply();
    console.warn('* result=', result);
    for (let x = 0; x < 1; x++) {
        result[x].myPrice = await getMyPrice(result[x].SellerSKU);
        result[x].productInfo = await mws.getMatchingProductForId({
            MarketplaceId: 'ATVPDKIKX0DER',
            IdType: 'ASIN',
            IdList: [result[x].ASIN]
            // IdList: ['B005NK7VTU'],
        });
    }
    console.warn('** result=', JSON.stringify(result, null, 4));
    return result;
}

if (require.main === module) {
    main(awskeys);
} else {
    module.exports = main;
}
