const { callEndpoint } = require('.');

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
 * @return {{ count: number, condition: string, fulfillmentChannel: string }}
 */
const reformatOfferCount = offerCount => ({
    count: parseInt(offerCount._, 10),
    condition: offerCount.$.condition,
    fulfillmentChannel: offerCount.$.fulfillmentChannel,
});

/**
 * Reformat an Offer
 *
 * @param {object} offer Offer from MWS API
 * @return {{ subCondition: string, sellerFeedbackRating: object, shippingTime: object, listingPrice: object, shipping: object, shipsFrom: object, isFulfilledByAmazon: boolean, isBuyBoxWinner: boolean, isFeaturedMerchant: boolean }}
 */
const reformatOffer = offer => ({
    subCondition: offer.SubCondition,
    sellerFeedbackRating: offer.SellerFeedbackRating,
    shippingTime: offer.ShippingTime.$,
    listingPrice: offer.ListingPrice,
    shipping: offer.Shipping,
    shipsFrom: offer.ShipsFrom,
    isFulfilledByAmazon: (offer.IsFulfilledByAmazon === 'true'),
    isBuyBoxWinner: (offer.IsBuyBoxWinner === 'true'),
    isFeaturedMerchant: (offer.IsFeaturedMerchant === 'true'),
});

const reformatLowestPrice = lp => ({
    condition: lp.$.condition,
    fulfillmentChannel: lp.$.fulfillmentChannel,
    landedPrice: lp.LandedPrice,
    listingPrice: lp.ListingPrice,
    shipping: lp.Shipping,
});

const reformatBuyBoxPrice = bb => ({
    condition: bb.$.condition,
    landedPrice: bb.LandedPrice,
    listingPrice: bb.ListingPrice,
    shipping: bb.Shipping,
});

/**
 * reformat an Offer Summary into something a little more sane looking
 *
 * @private
 * @param {object} Offer Summary (has lots of keys)
 * @return {object}
 */
const reformatSummary = (summary) => {
    // this little mess for setting up buyBoxPrices is thanks to flattenResult flattening the
    // very first node of the tree inappropriately.  Not quite sure how to prevent that, right
    // at this moment, though.
    // TODO: when we fix flattenResult to not flatten the very first node, we need to fix this area.
    // TODO: there is also one other area that would break, but I can't remember what it was.
    // Hopefully we have a test for it.

    let buyBoxPrices = [];
    if (summary.BuyBoxPrices && summary.BuyBoxPrices.BuyBoxPrice) {
        if (summary.BuyBoxPrices.BuyBoxPrice.length) {
            buyBoxPrices = summary.BuyBoxPrices.BuyBoxPrice;
        } else {
            buyBoxPrices = [summary.BuyBoxPrices.BuyBoxPrice];
        }
    }

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
 * getLowestPricedOffersForASIN
 *
 * @param {object} options see https://docs.developer.amazonservices.com/en_UK/products/Products_GetLowestPricedOffersForASIN.html
 * @param {string} options.MarketplaceId Marketplace ID to search
 * @param {string} options.ASIN ASIN to search for
 * @param {string} options.ItemCondition Listing Condition: New, Used, Collectible, Refurbished, Club
 *
 * @return {{ asin: string, marketplace: string, itemCondition: string, summary: object, offers: array }}
 */
const getLowestPricedOffersForASIN = async (options) => {
    const results = await callEndpoint('GetLowestPricedOffersForASIN', options);
    const identifier = results.Identifier;
    const summary = results.Summary;

    // TODO: same comment as above on buyBoxPrices.
    let offers = [];
    if (results.Offers && results.Offers.Offer) {
        if (results.Offers.Offer.length) {
            offers = results.Offers.Offer;
        } else {
            offers = [results.Offers.Offer];
        }
    }

    const ret = {};
    ret.asin = identifier.ASIN;
    ret.marketplace = identifier.MarketplaceId;
    ret.itemCondition = identifier.ItemCondition;
    ret.summary = reformatSummary(summary);
    ret.lowestOffers = offers.map(reformatOffer);
    return ret;
};

module.exports = { getLowestPricedOffersForASIN };
