const { callEndpoint } = require('./callEndpoint');
const { forceArray } = require('./util/transformers');

/**
 * @typedef OfferCount
 * @param {number} count
 * @param {string} condition
 * @param {string} fulfillmentChannel
 */
/**
 * Reformat an OfferCount. Incoming OfferCount looks like:
 *   {
 *      "_": "31",
 *       "$": {
 *           "condition": "used",
 *           "fulfillmentChannel": "Merchant"
 *       }
 *   }
 *
 * @private
 * @param {object} offerCount OfferCount from MWS API
 * @param {string} offerCount._ Number of Offers that match this type
 * @param {object} offerCount.$ Object describing the type of Offers
 * @param {object} offerCount.$.condition Offer Condition (used, new, etc)
 * @param {object} offerCount.$.fulfillmentChannel Merchant or Amazon (FBM or FBA)
 *
 * @return {OfferCount}
 */
const reformatOfferCount = offerCount => ({
    count: parseInt(offerCount._, 10),
    condition: offerCount.$.condition,
    fulfillmentChannel: offerCount.$.fulfillmentChannel,
});

/** @typedef SellerFeedbackRating
 * @param {string} unknown
 */
/** @typedef DetailedShippingTime
 * @param {string} unknown
 */
/** @typedef Money
 * @param {string} unknown
 */
/** @typedef ShipsFrom
 * @param {string} unknown
 */

/**
 * @typedef Offer
 * @param {string} subCondition - The subcondition of the item (New, Mint, Very Good, Good, Acceptable, Poor, Club, OEM, Warranty, Refurbished Warranty, Refurbished, Open Box, or Other)
 * @param {SellerFeedbackRating} sellerFeedbackRating - Information about the seller's feedback
 * @param {DetailedShippingTime} shippingTime - Maximum time within which the item will likely be shipped
 * @param {Money} listingPrice - The price of the item
 * @param {Points} [points] - The number of Amazon Points offered with the purchase of an item
 * @param {Money} shipping - Cost of shipping
 * @param {ShipsFrom} [shipsFrom] - State and Country where item is shipped from
 * @param {boolean} isFulfilledByAmazon - True if FBA, False if not
 * @param {boolean} [isBuyBoxWinner] - True if offer has buy box, False if not
 * @param {boolean} [isFeaturedMerchant] - True if seller is eligible for Buy Box, False if not
 */

/**
 * Reformat an Offer
 *
 * @private
 * @param {object} offer Offer from MWS API
 * @return {Offer}
 */
const reformatOffer = offer => ({
    subCondition: offer.SubCondition,
    sellerFeedbackRating: offer.SellerFeedbackRating,
    shippingTime: offer.ShippingTime.$,
    listingPrice: offer.ListingPrice,
    shipping: offer.Shipping,
    shipsFrom: offer.ShipsFrom,
    points: offer.Points,
    isFulfilledByAmazon: (offer.IsFulfilledByAmazon === 'true'),
    isBuyBoxWinner: (offer.IsBuyBoxWinner === 'true'),
    isFeaturedMerchant: (offer.IsFeaturedMerchant === 'true'),
});

/**
 * @typedef LowestPrice
 * @param {string} condition
 * @param {string} fulfillmentChannel
 * @param {Money} landedPrice
 * @param {Money} listingPrice
 * @param {string} shipping
 */
/**
 * Reformat a Lowest Price
 *
 * @private
 * @param {object} lp Lowest Price object from MWS API
 * returns {LowestPrice}
 */
const reformatLowestPrice = lp => ({
    condition: lp.$.condition,
    fulfillmentChannel: lp.$.fulfillmentChannel,
    landedPrice: lp.LandedPrice,
    listingPrice: lp.ListingPrice,
    shipping: lp.Shipping,
});

/** @typedef BuyBoxPrice
 * @param {string} condition
 * @param {Money} landedPrice
 * @param {Money} listingPrice
 * @param {Money} shipping
 */

/**
 * Reformat a Buy Box Price
 *
 * @private
 * @param {any} bb Buy Box Price object from MWS API
 * returns {BuyBoxPrice}
 */
const reformatBuyBoxPrice = bb => ({
    condition: bb.BuyBoxPrice.$.condition,
    landedPrice: bb.BuyBoxPrice.LandedPrice,
    listingPrice: bb.BuyBoxPrice.ListingPrice,
    shipping: bb.BuyBoxPrice.Shipping,
});
// const reformatBuyBoxPrice = bb => {
//     console.warn('**** bb=', bb.$);
//     return bb;
// }

/**
 * @typedef OfferSummary
 * @param {number} totalOfferCount
 * @param {number} numberOfOffers
 * @param {Money} listPrice
 * @param {LowestPrice[]} lowestPrices
 * @param {Array} buyBoxPrices
 */

/**
 * reformat an Offer Summary into something a little more sane looking
 *
 * @private
 * @param {object} Offer Summary (has lots of keys)
 * @return {OfferSummary}
 */
const reformatSummary = (summary) => {
    console.warn('**** buyBoxPrices=', JSON.stringify(forceArray(summary.BuyBoxPrices)));
    const buyBoxPrices = forceArray(summary.BuyBoxPrices);

    const ret = {};
    ret.totalOfferCount = parseInt(summary.TotalOfferCount, 10);
    ret.numberOfOffers = summary.NumberOfOffers.OfferCount.map(reformatOfferCount);
    ret.listPrice = summary.ListPrice;
    ret.lowestPrices = summary.LowestPrices.LowestPrice.map(reformatLowestPrice);
    ret.buyBoxPrices = buyBoxPrices && buyBoxPrices.map(reformatBuyBoxPrice);
    ret.buyBoxEligibleOffers = summary.BuyBoxEligibleOffers.OfferCount.map(reformatOfferCount);

    return ret;
};

/**
 * @typedef LowestPricedOffers
 * @param {string} asin - asin returned by request
 * @param {string} marketplace - marketplace asin is in
 * @param {string} itemCondition - condition of item requested
 * @param {OfferSummary} summary -
 * @param {Offers[]} offers - list of offers
 */
/**
 * getLowestPricedOffersForASIN
 *
 * Calls GetLowestPricedOffersForASIN, reformats results, and returns the data
 *
 * @param {object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetLowestPricedOffersForASIN.html
 * @param {string} options.MarketplaceId Marketplace ID to search
 * @param {string} options.ASIN ASIN to search for
 * @param {string} options.ItemCondition Listing Condition: New, Used, Collectible, Refurbished, Club
 *
 * @return {LowestPricedOffers}
 */
const getLowestPricedOffersForASIN = async (options) => {
    const results = await callEndpoint('GetLowestPricedOffersForASIN', options);
    const identifier = results.Identifier;
    const summary = results.Summary;

    const offers = forceArray(results.Offers.Offer);

    const ret = {};
    ret.asin = identifier.ASIN;
    ret.marketplace = identifier.MarketplaceId;
    ret.itemCondition = identifier.ItemCondition;
    ret.summary = reformatSummary(summary);
    ret.lowestOffers = offers.map(reformatOffer);
    return ret;
};

module.exports = { getLowestPricedOffersForASIN };
