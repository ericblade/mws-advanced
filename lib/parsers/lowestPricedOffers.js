const { forceArray } = require('../util/transformers');

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
const reformatOfferCount = (offerCount) => ({
    count: parseInt(offerCount._, 10),
    condition: offerCount.$.condition,
    fulfillmentChannel: offerCount.$.fulfillmentChannel,
});

/**
 * @typedef SellerFeedbackRating
 * @param {string} unknown
 */
/**
 * @typedef DetailedShippingTime
 * @param {string} unknown
 */
/**
 * @typedef Money
 * @param {string} unknown
 */
/**
 * @typedef ShipsFrom
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
const reformatOffer = (offer) => ({
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
const reformatLowestPrice = (lp) => ({
    condition: lp.$.condition,
    fulfillmentChannel: lp.$.fulfillmentChannel,
    landedPrice: lp.LandedPrice,
    listingPrice: lp.ListingPrice,
    shipping: lp.Shipping,
});

/**
 * @typedef BuyBoxPrice
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
// TODO: remove this eslint disable someday. i'm constantly mucking inside this function right now, though.
// eslint-disable-next-line arrow-body-style
const reformatBuyBoxPrice = (bb) => {
    return {
        condition: bb.$.condition,
        landedPrice: bb.LandedPrice,
        listingPrice: bb.ListingPrice,
        shipping: bb.Shipping,
    };
};
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
    const ret = {};
    ret.totalOfferCount = parseInt(summary.TotalOfferCount, 10);

    const numberOfOffers = forceArray(summary.NumberOfOffers && summary.NumberOfOffers.OfferCount);
    ret.numberOfOffers = numberOfOffers.map(reformatOfferCount);

    ret.listPrice = summary.ListPrice;
    const lowestPrices = forceArray(summary.LowestPrices && summary.LowestPrices.LowestPrice);
    ret.lowestPrices = lowestPrices.map(reformatLowestPrice);

    const buyBoxPrices = forceArray(summary.BuyBoxPrices && summary.BuyBoxPrices.BuyBoxPrice);
    ret.buyBoxPrices = buyBoxPrices && buyBoxPrices.map(reformatBuyBoxPrice);

    const buyBoxEligibleOffers = forceArray(summary.BuyBoxEligibleOffers && summary.BuyBoxEligibleOffers.OfferCount);
    ret.buyBoxEligibleOffers = buyBoxEligibleOffers.map(reformatOfferCount);

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

function parseLowestPricedOffers(offerData) {
    const identifier = offerData.Identifier;
    const summary = offerData.Summary;

    const offers = forceArray(offerData.Offers.Offer);

    const ret = {
        asin: identifier.ASIN,
        marketplace: identifier.MarketplaceId,
        itemCondition: identifier.ItemCondition,
        summary: reformatSummary(summary),
        lowestOffers: offers.map(reformatOffer),
    };
    return ret;
}

module.exports = parseLowestPricedOffers;
