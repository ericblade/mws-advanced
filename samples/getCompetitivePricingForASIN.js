const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

// {
//     "$": {
//         "ASIN": "142210284X",
//         "status": "Success"
//     },
//     "Product": {
//         "$": {
//             "xmlns": "http://mws.amazonservices.com/schema/Products/2011-10-01",
//             "xmlns:ns2": "http://mws.amazonservices.com/schema/Products/2011-10-01/default.xsd"
//         },
//         "Identifiers": {
//             "MarketplaceASIN": {
//                 "MarketplaceId": "ATVPDKIKX0DER",
//                 "ASIN": "142210284X"
//             }
//         },
//         "CompetitivePricing": {
//             "CompetitivePrices": {
//                 "CompetitivePrice": [
//                     {
//                         "$": {
//                             "belongsToRequester": "false",
//                             "condition": "New",
//                             "subcondition": "New"
//                         },
//                         "CompetitivePriceId": "1",
//                         "Price": {
//                             "LandedPrice": {
//                                 "CurrencyCode": "USD",
//                                 "Amount": "19.79"
//                             },
//                             "ListingPrice": {
//                                 "CurrencyCode": "USD",
//                                 "Amount": "19.79"
//                             },
//                             "Shipping": {
//                                 "CurrencyCode": "USD",
//                                 "Amount": "0.00"
//                             }
//                         }
//                     },
//                     {
//                         "$": {
//                             "belongsToRequester": "false",
//                             "condition": "Used",
//                             "subcondition": "Good"
//                         },
//                         "CompetitivePriceId": "2",
//                         "Price": {
//                             "LandedPrice": {
//                                 "CurrencyCode": "USD",
//                                 "Amount": "7.93"
//                             },
//                             "ListingPrice": {
//                                 "CurrencyCode": "USD",
//                                 "Amount": "7.93"
//                             },
//                             "Shipping": {
//                                 "CurrencyCode": "USD",
//                                 "Amount": "0.00"
//                             }
//                         }
//                     }
//                 ]
//             },
//             "NumberOfOfferListings": {
//                 "OfferListingCount": [
//                     {
//                         "_": "12",
//                         "$": {
//                             "condition": "New"
//                         }
//                     },
//                     {
//                         "_": "32",
//                         "$": {
//                             "condition": "Used"
//                         }
//                     },
//                     {
//                         "_": "44",
//                         "$": {
//                             "condition": "Any"
//                         }
//                     }
//                 ]
//             }
//         },
//         "SalesRankings": {
//             "SalesRank": [
//                 {
//                     "ProductCategoryId": "book_display_on_website",
//                     "Rank": "696943"
//                 },
//                 {
//                     "ProductCategoryId": "2637",
//                     "Rank": "2622"
//                 },
//                 {
//                     "ProductCategoryId": "2745",
//                     "Rank": "5338"
//                 },
//                 {
//                     "ProductCategoryId": "2683",
//                     "Rank": "7907"
//                 }
//             ]
//         }
//     }
// }

const parseData = (data) => {
    console.log(JSON.stringify(data, null, 4));
};

async function main() {
    try {
        await mws.parseEndpoint('GetCompetitivePricingForASIN', {
            MarketplaceId: 'ATVPDKIKX0DER',
            ASINList: ['142210284X'],
        })(parseData);
        // const results = await mws.callEndpoint('GetCompetitivePricingForASIN', {
        //     MarketplaceId: 'ATVPDKIKX0DER',
        //     ASINList: ['142210284X', '1844161668', '0989391108', 'B009NOF57C'],
        // });
        // console.log(JSON.stringify(results, null, 4));
    } catch (err) {
        console.warn('* sample error', err);
    }
}

main();
