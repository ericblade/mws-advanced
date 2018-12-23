// note that if your throttle is clear at the start of running this, you
// should expect it to take right around 7 minutes or so to complete a 20
// request spam to getMarketplaces() or around 1 minute for each 10 reqs to getCats

const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

/* eslint-disable no-sequences */
const getCats = asins => (
    console.warn('* getting categories for asin count', asins.length),
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
        // '0814471048',
        // 'B000GCWNPW',
        // 'B0027DPF62',
        // 'B00005T3EN',
        // 'B00006I5V6',
        // '159116060X',
        // 'B003FBG4SS',
        // '0321568095',
        // 'B00006B8FZ',
        // 'B0000AHOOM',
        // 'B00000JQQH',
        // '0078034639',
    ]);
}

// async function main() {
//     const arr = [];
//     for (let x = 0; x < 20; x += 1) {
//         arr.push(new Promise((resolve) => {
//             setTimeout(() => mws.getMarketplaces().then(res => resolve(res)), x * 200);
//         }));
//     }
//     await Promise.all(arr).catch(err => console.warn('* err', err));
//     return arr;
// }

/* eslint-disable */
let x = 1;
while (x-- > 0) {
    main().then(res => {
        console.warn('* res length=', res.length);
    }).catch(err => {
        console.warn('* error completing?!', err);
    });
}
