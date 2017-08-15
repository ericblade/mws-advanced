const mws = require('..');

function getTestDate(daysAgo) {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() - daysAgo);
    return testDate.toISOString();
}

async function testListInventorySupply() {
    const startDate = getTestDate(7);
    return await mws.listInventorySupply({ QueryStartDateTime: startDate });
}

async function main(keys) {
    mws.init(keys);
    const result = await testListInventorySupply();
    console.warn('** result=', result);
    return result;
}

if (require.main === module) {
    main();
} else {
    module.exports = main;
}
