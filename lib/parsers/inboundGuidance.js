const { forceArray, reduceArrayIntoObjBy } = require('../util/transformers');


/**
 * http://docs.developer.amazonservices.com/en_US/fba_inbound/FBAInbound_Datatypes.html#InvalidASIN
 * @typedef {object} MWSInvalidASIN
 * @property {string} ASIN
 * @property {string} ErrorReason
 */

/**
 * @typedef {object} MWSInvalidASINList
 * @property {MWSInvalidASIN[]} InvalidASIN
 */

/**
 * @typedef {object} invalidAsin
 * @property {string} asin
 * @property {string} error
 */

/**
 * converts MWSInvalidASIN to invalidAsin
 *
 * @param {MWSInvalidASIN} mwsInvalidAsin invalid ASIN data from amazon
 * @returns invalidAsin
 */
function parseInvalidAsin(mwsInvalidAsin) {
    return { asin: mwsInvalidAsin.ASIN, error: mwsInvalidAsin.ErrorReason };
}

/**
 * convers MWSInvalidASINList to invalidAsin[]
 *
 * @param {MWSInvalidASINList} mwsInvalidAsinList
 * @returns
 */
function parseInvalidAsinList(mwsInvalidAsinList) {
    let { InvalidASIN: list } = mwsInvalidAsinList;
    list = forceArray(list);
    return list.map(parseInvalidAsin);
}

/**
 * http://docs.developer.amazonservices.com/en_US/fba_inbound/FBAInbound_Datatypes.html#InvalidSKU
 * @typedef MWSInvalidSKU
 * @property {string} SellerSKU SellerSKU for item
 * @property {string} ErrorReason Reason for error
 */

/**
 * @typedef invalidSku
 * @property {string} sku seller's sku for item
 * @property {string} error reason for error
 */

/**
 * @typedef {object} MWSInvalidSKUList
 * @property {MWSInvalidSku[]} InvalidSKU
 */

/**
 * convert MWSInvalidSKU to invalidSku
 *
 * @param {MWSInvalidSKU} mwsInvalidSku
 * @returns {invalidSku}
 */
function parseInvalidSku(mwsInvalidSku) {
    return { sku: mwsInvalidSku.SellerSKU, error: mwsInvalidSku.ErrorReason };
}

/**
 * Convert MWSInvalidSKUList to invalidSku[]
 *
 * @param {MWSInvalidSKUList} mwsInvalidSkuList
 * @returns {invalidSku[]}
 */
function parseInvalidSkuList(mwsInvalidSkuList) {
    let { InvalidSKU: list } = mwsInvalidSkuList;
    list = forceArray(list);
    return list.map(parseInvalidSku);
}

/**
 * https://docs.developer.amazonservices.com/en_UK/fba_inbound/FBAInbound_Datatypes.html#GuidanceReason
 * Amazon says this is a list, but I can only get it to return as a single item.
 * This might be a bug in Amazon or docs or us, not sure.
 * @typedef MWSGuidanceReasonList
 * @property {string} GuidanceReason reason for amazon guidance
 */

/**
 * @typedef {string} guidanceReason reason for amazon guidance
 */

/**
 * convert MWSGuidanceReasonList to guidanceReason
 *
 * @param {MWSGuidanceReasonList} mwsGuidanceReasonList
 * @returns {guidanceReason}
 */
function parseGuidanceReasonList(mwsGuidanceReasonList) {
    const { GuidanceReason } = mwsGuidanceReasonList;
    return GuidanceReason;
}

/**
 * https://docs.developer.amazonservices.com/en_UK/fba_inbound/FBAInbound_Datatypes.html#InboundGuidance
 * @typedef {string} MWSInboundGuidance may contain "InboundOK" or "InboundNotRecommended"
 */

// TODO: typedef sku and asin somewhere in docs
/**
 * @typedef inboundGuidance
 * @property {string} [sku] seller SKU
 * @property {string} asin amazon ASIN
 * @property {MWSInboundGuidance} guidance type of guidance
 * @property {guidanceReason} reason reason for the guidance, empty for 'InboundOK'
 */

/**
 * https://docs.developer.amazonservices.com/en_UK/fba_inbound/FBAInbound_Datatypes.html#ASINInboundGuidance
 * @typedef MWSASINInboundGuidance
 * @property {string} ASIN
 * @property {MWSInboundGuidance} InboundGuidence
 * @property {MWSGuidanceReasonList} GuidanceReasonList
 */
function parseAsinInboundGuidance(mwsAsinInboundGuidance) {
    const { GuidanceReasonList } = mwsAsinInboundGuidance;
    const reason = GuidanceReasonList ? parseGuidanceReasonList(GuidanceReasonList) : '';
    return {
        asin: mwsAsinInboundGuidance.ASIN,
        guidance: mwsAsinInboundGuidance.InboundGuidance,
        reason,
    };
}

/**
 * @typedef {MWSInboundGuidance[]} MWSASINInboundGuidanceList
 */

/**
 * convert MWSASINInboundGuidanceList to inboundGuidance[]
 *
 * @param {MWSASINInboundGuidanceList} mwsAsinInboundGuidanceList
 * @returns {inboundGuidance[]}
 */
function parseAsinInboundGuidanceList(mwsAsinInboundGuidanceList) {
    let { ASINInboundGuidance: list } = mwsAsinInboundGuidanceList;
    list = forceArray(list);
    return list.map(parseAsinInboundGuidance);
}

/**
 * https://docs.developer.amazonservices.com/en_UK/fba_inbound/FBAInbound_Datatypes.html#SKUInboundGuidance
 * @typedef MWSSKUInboundGuidance
 * @property {string} SellerSKU
 * @property {string} ASIN
 * @property {MWSInboundGuidance} InboundGuidance
 * @property {MWSGuidanceReasonList} GuidanceReasonList
 */

/**
 * convert MWSSKUInboundGuidance to inboundGuidance
 *
 * @param {MWSSKUInboundGuidance} mwsSkuInboundGuidance
 * @returns {inboundGuidance}
 */
function parseSkuInboundGuidance(mwsSkuInboundGuidance) {
    const { GuidanceReasonList } = mwsSkuInboundGuidance;
    const reason = GuidanceReasonList ? parseGuidanceReasonList(GuidanceReasonList) : '';
    return {
        sku: mwsSkuInboundGuidance.SellerSKU,
        asin: mwsSkuInboundGuidance.ASIN,
        guidance: mwsSkuInboundGuidance.InboundGuidance,
        reason,
    };
}

/**
 * @typedef {MWSSKUInboundGuidance[]} MWSSKUInboundGuidanceList
 */

/**
 * convert MWSSKUInboundGuidanceList to inboundGuidance[]
 *
 * @param {MWSSkuInboundGuidanceList} guidanceList
 * @returns {inboundGuidance[]}
 */
function parseSkuInboundGuidanceList(guidanceList) {
    let { SKUInboundGuidance: list } = guidanceList;
    list = forceArray(list);
    return list.map(parseSkuInboundGuidance);
}

/*
 * Determine if a passed guidance is a SKUInboundGuidance or an ASINInboundGuidance, and
 * parse it with the appropriate subparser.
 *
 * @param {object} guidance contains SKUInboundGuidance/ASINInboundGuidance/InvalidASINList/InvalidSKUList
 * @param {MWSInvalidASINList} [InvalidASINList]
 * @param {MWSInvalidSKUList} [InvalidSKUList]
 * @param {MWSASINInboundGuidanceList} [ASINInboundGuidanceList]
 * @param {MWSSKUInboundGuidanceList} [SKUInboundGuidanceList]
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
        results = reduceArrayIntoObjBy(parseInvalidAsinList(InvalidASINList), results, 'asin');
    }
    if (InvalidSKUList) {
        results = reduceArrayIntoObjBy(parseInvalidSkuList(InvalidSKUList), results, 'sku');
    }
    if (ASINInboundGuidanceList) {
        const p = parseAsinInboundGuidanceList(ASINInboundGuidanceList);
        results = reduceArrayIntoObjBy(p, results, 'asin');
    }
    if (SKUInboundGuidanceList) {
        const p = parseSkuInboundGuidanceList(SKUInboundGuidanceList);
        results = reduceArrayIntoObjBy(p, results, 'sku');
    }
    return results;
}

module.exports = parseAnyInboundGuidance;

if (process.env.NODE_ENV === 'testing') {
    Object.assign(module.exports, {
        parseInvalidAsin,
        parseInvalidAsinList,
        parseInvalidSku,
        parseInvalidSkuList,
        parseAnyInboundGuidance,
        parseAsinInboundGuidance,
        parseAsinInboundGuidanceList,
        parseGuidanceReasonList,
        parseSkuInboundGuidance,
        parseSkuInboundGuidanceList,
    });
}
