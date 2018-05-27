const { forceArray, transformObjectKeys } = require('../util/transformers');

function getFeesEstimate(e) {
    return e.FeesEstimate || { TotalFeesEstimate: undefined, time: undefined, detail: undefined };
}

function getIdentifierData(e) {
    return e.FeesEstimateIdentifier;
}

function getSellerInputIdentifier(e) {
    return getIdentifierData(e).SellerInputIdentifier;
}

function getTotalFeesEstimate(e) {
    return getFeesEstimate(e).TotalFeesEstimate;
}

function getTimeOfFeesEstimation(e) {
    return getFeesEstimate(e).TimeOfFeesEstimation;
}

function getFeeDetailList(e) {
    const x = getFeesEstimate(e).FeeDetailList;
    const list = x ? x.FeeDetail : x;
    return list ? forceArray(list) : undefined;
}

function parseFeesEstimate(fees) {
    const res2 = forceArray(fees.FeesEstimateResultList.FeesEstimateResult);
    const feeList = res2.reduce((acc, e) => {
        const sellerIdentifier = getSellerInputIdentifier(e);
        const identifierData = { ...getIdentifierData(e) };

        identifierData.IsAmazonFulfilled = identifierData.IsAmazonFulfilled === 'true';

        acc[sellerIdentifier] = {
            totalFees: getTotalFeesEstimate(e),
            time: getTimeOfFeesEstimation(e),
            detail: getFeeDetailList(e),
            identifier: identifierData,
            status: e.Status,
            error: e.Error || undefined,
        };
        return acc;
    }, {});

    return transformObjectKeys(feeList);
}

module.exports = parseFeesEstimate;
