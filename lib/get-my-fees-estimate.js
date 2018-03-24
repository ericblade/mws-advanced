const { callEndpoint } = require('./callEndpoint');
const { forceArray } = require('./util/transformers');

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
        ret[e.FeesEstimateIdentifier.SellerInputIdentifier] = {
            totalFees: est.TotalFeesEstimate,
            time: est.TimeOfFeesEstimation,
            detail: est.FeeDetailList,
            identifier: e.FeesEstimateIdentifier,
            status: e.Status,
            error: e.Error || undefined,
        };
    });
    return ret;
};

module.exports = {
    getMyFeesEstimate,
};
