const { forceArray } = require('../util/transformers');

// InboundGuidance xs:string
// https://docs.developer.amazonservices.com/en_UK/fba_inbound/FBAInbound_Datatypes.html#InboundGuidance
// values: "InboundNotRecommended", "InboundOK"

// GuidanceReason xs:string
// https://docs.developer.amazonservices.com/en_UK/fba_inbound/FBAInbound_Datatypes.html#GuidanceReason
// values: "SlowMovingASIN", "NoApplicableGuidance"

// SKUInboundGuidance
// https://docs.developer.amazonservices.com/en_UK/fba_inbound/FBAInbound_Datatypes.html#SKUInboundGuidance
// SellerSKU xs:string
// ASIN xs:string
// InboundGuidance InboundGuidance
// GuidanceReasonList List of GuidanceReason

// ASINInboundGuidance
// https://docs.developer.amazonservices.com/en_UK/fba_inbound/FBAInbound_Datatypes.html#ASINInboundGuidance
// ASIN xs:string
// InboundGuidance InboundGuidance
// GuidanceReasonList List of GuidanceReason

// InvalidASINList
// TODO: link to docs
// List of InvalidASIN

// InvalidASIN
// TODO: link to docs
// contains { ASIN: 'B00...', ErrorReason: 'InvalidASIN' }

function parseInvalidAsin(invalidAsin) {
    return { asin: invalidAsin.ASIN, error: invalidAsin.ErrorReason };
}

function parseInvalidAsinList(asinList) {
    let { InvalidASIN: list } = asinList;
    list = forceArray(list);
    return list.map(parseInvalidAsin);
}

// InvalidSKU
// TODO: link to docs
// contains { SellerSKU: '...', ErrorReason: 'InvalidSKU' }

function parseInvalidSku(invalidSku) {
    return { sku: invalidSku.SellerSKU, error: invalidSku.ErrorReason };
}

// InvalidSKUList
// TODO: link to docs
// List of InvalidSKU
function parseInvalidSkuList(skuList) {
    let { InvalidSKU: list } = skuList;
    list = forceArray(list);
    return list.map(parseInvalidSku);
}

// this is called a list, but it only ever comes up in singles.
// that might change in the future?
function parseGuidanceReasonList(reasonList) {
    const { GuidanceReason } = reasonList;
    return GuidanceReason;
}

function parseAsinInboundGuidance(guidance) {
    const { GuidanceReasonList } = guidance;
    const reason = GuidanceReasonList ? parseGuidanceReasonList(GuidanceReasonList) : '';
    return {
        asin: guidance.ASIN,
        guidance: guidance.InboundGuidance,
        reason,
    };
}

function parseAsinInboundGuidanceList(guidanceList) {
    let { ASINInboundGuidance: list } = guidanceList;
    list = forceArray(list);
    return list.map(parseAsinInboundGuidance);
}

function parseSkuInboundGuidance(guidance) {
    const { GuidanceReasonList } = guidance;
    const reason = GuidanceReasonList ? parseGuidanceReasonList(GuidanceReasonList) : '';
    return {
        sku: guidance.SellerSKU,
        asin: guidance.ASIN,
        guidance: guidance.InboundGuidance,
        reason,
    };
}

function parseSkuInboundGuidanceList(guidanceList) {
    let { SKUInboundGuidance: list } = guidanceList;
    list = forceArray(list);
    return list.map(parseSkuInboundGuidance);
}

/*
 * Determine if a passed guidance is a SKUInboundGuidance or an ASINInboundGuidance, and
 * parse it with the appropriate subparser.
 *
 * @param {object} SKUInboundGuidance or ASINInboundGuidance
 * @return {object} formatted inbound guidance
 */
function parseAnyInboundGuidance(guidance) {
    // console.warn('* inbound guidance=%o', guidance);
    const {
        InvalidASINList,
        InvalidSKUList,
        ASINInboundGuidanceList,
        SKUInboundGuidanceList,
    } = guidance;
    let results = {};
    if (InvalidASINList) {
        results = parseInvalidAsinList(InvalidASINList).reduce((acc, next) => {
            acc[next.asin] = { error: next.error };
            return acc;
        }, results);
    }
    if (InvalidSKUList) {
        results = parseInvalidSkuList(InvalidSKUList).reduce((acc, next) => {
            acc[next.sku] = { error: next.error };
            return acc;
        }, results);
    }
    if (ASINInboundGuidanceList) {
        results = parseAsinInboundGuidanceList(ASINInboundGuidanceList).reduce((acc, next) => {
            acc[next.asin] = { guidance: next.guidance, reason: next.reason };
            return acc;
        }, results);
    }
    if (SKUInboundGuidanceList) {
        results = parseSkuInboundGuidanceList(SKUInboundGuidanceList).reduce((acc, next) => {
            acc[next.asin] = { guidance: next.guidance, reason: next.reason, sku: next.sku };
            return acc;
        }, results);
    }
    return results;
}

module.exports = parseAnyInboundGuidance;
