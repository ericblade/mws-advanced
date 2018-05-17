const { forceArray, transformObjectKeys } = require('../util/transformers');

function parseFeesEstimate(fees) {
    const res2 = forceArray(fees.FeesEstimateResultList.FeesEstimateResult);

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
}

module.exports = parseFeesEstimate;
