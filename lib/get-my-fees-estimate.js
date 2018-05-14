const { callEndpoint } = require('./callEndpoint');
const { forceArray, transformObjectKeys } = require('./util/transformers');

/**
 * @typedef EstimateRequest - an Estimate Request object
 * @param {string} marketplaceId - MWS MarketplaceId to request item within
 * @param {string} idType - type of identifier for item (ASIN, GCID, SellerSKU, UPC, EAN, ISBN, JAN)
 * @param {string} idValue - identifier to use (see idType)
 * @param {boolean} isAmazonFulfilled - true for FBA fees, false for Merchant Fulfilled fees
 * @param {Money} listingPrice - currencyCode and amount for listing price
 * @param {Money} shipping - currencyCode and amount for shipping price
 * @param {object} points - pointsNumber: amazon points for purchase (Japan only?)
 * @param {string} [identifier] - identifier to attach to request. If not given, will be `FBA.${idValue}` for FBA requests or `MF.${idValue}` for MF requests
 */

/**
 * @typedef FeeDetail - a detailed Fee object
 * @param {string} feeType - The type of fee (ReferralFee, PerItemFee, VariableClosingFee, etc)
 * @param {Money} feeAmount - Base fee, currencyCode and amount
 * @param {Money} feePromotion - Discounts applied to fee, currencyCode and amount
 * @param {Money} finalFee - feeAmount minus feePromotion, currencyCode and amount
 */

/**
 * @typedef FeeIdentifier
 * @param {string} marketplaceId - MWS MarketplaceId requested
 * @param {string} idType - type of identifier requested
 * @param {string} sellerId - the seller identifier that requested the estimate
 * @param {boolean} isAmazonFulfilled - true for FBA, false for Merchant Fulfilled
 * @param {string} sellerInputIdentifier - identifier from EstimateRequest
 * @param {string} idValue - the product idValue from EstimateRequest
 * @param {object} priceToEstimateFees - Money values entered in as listingPrice and shipping to EstimateRequest
 * @param {Money} priceToEstimateFees.listingPrice - listingPrice from EstimateRequest
 * @param {Money} priceToEstimateFees.shipping - shipping from EstimateRequest
 */

/**
 * @typedef Estimate
 * @param {Money} totalFees - currencyCode and amount for total fees
 * @param {string} time - ISO8601 time stamp format time the fee response was created
 * @param {FeeDetail[]} detail - array of details about each of the fees that make up totalFees
 * @param {FeeIdentifier} identifier - information about the EstimateRequest
 * @param {string} status - "Success" for success or "ServerError" for request failure
 * @param {Error} [error] - If an Error occurred (success === "Failure"), a description of the Error
 */

/**
 * Get an estimate of fees for an item, based on listing and shipping prices.
 *
 * @param {EstimateRequest[]} - Array of EstimateRequest items to get fees for
 * @returns {Object} - Object of Estimate items, indexed by EstimateRequest Identifier
 */
const getMyFeesEstimate = async (estimates) => {
    const estimateList = forceArray(estimates);
    const query = { };
    estimateList.forEach((e, index) => {
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.MarketplaceId`] = e.marketplaceId; // TODO: should there be a default marketplaceId ?!
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.IdType`] = e.idType;
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.IdValue`] = e.idValue;
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.IsAmazonFulfilled`] = !!e.isAmazonFulfilled;
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.Identifier`] = e.identifier || `${(e.isAmazonFulfilled ? 'FBA' : 'MF')}.${e.idValue}`;
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.PriceToEstimateFees.ListingPrice.CurrencyCode`] = e.listingPrice.currencyCode;
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.PriceToEstimateFees.ListingPrice.Amount`] = e.listingPrice.amount;
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.PriceToEstimateFees.Shipping.CurrencyCode`] = e.shipping.currencyCode;
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.PriceToEstimateFees.Shipping.Amount`] = e.shipping.amount;
        query[`FeesEstimateRequestList.FeesEstimateRequest.${index + 1}.Points.PointsNumber`] = e.points ? e.points.pointsNumber : 0;
    });

    const res = await callEndpoint('GetMyFeesEstimate', query);
    const res2 = forceArray(res.FeesEstimateResultList.FeesEstimateResult);

    const ret = {};
    res2.forEach((e) => {
        const est = e.FeesEstimate || { TotalFeesEstimate: undefined, time: undefined, detail: undefined };
        const identifierData = { ...e.FeesEstimateIdentifier };
        const { SellerInputIdentifier: sellerIdentifier } = identifierData;
        identifierData.IsAmazonFulfilled = identifierData.IsAmazonFulfilled === 'true';
        ret[sellerIdentifier] = {
            totalFees: est.TotalFeesEstimate,
            time: est.TimeOfFeesEstimation,
            detail: est.FeeDetailList ? forceArray(est.FeeDetailList.FeeDetail) : undefined,
            identifier: identifierData,
            status: e.Status,
            error: e.Error || undefined,
        };
    });
    return transformObjectKeys(ret);
};

module.exports = {
    getMyFeesEstimate,
};
