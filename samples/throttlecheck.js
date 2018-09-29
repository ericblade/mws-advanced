const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

const getCats = asins => (
    mws.getProductCategoriesForAsins({
        marketplaceId: 'ATVPDKIKX0DER',
        asins,
    })
);

async function main() {
    return getCats([
        '0534645577',
        'B00IDD9TU8',
        'B00IH00CN0',
        'B07CBM6CDD',
        'B00OPXKUDK',
        '1573833908',
        '1578262666',
        '517029252X',
        '0810408813',
        '0793802946',
        '0814471048',
        'B000GCWNPW',
        'B0027DPF62',
        'B00005T3EN',
        'B00006I5V6',
        '159116060X',
        'B003FBG4SS',
        '0321568095',
        'B00006B8FZ',
        'B0000AHOOM',
        'B00000JQQH',
        '0078034639',
    ]);
}

/* eslint-disable */
let x = 1;
while (x-- > 0) {
    main().then(x => {
        console.warn('* x=', x);
    });
}
