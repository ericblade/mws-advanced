const parseInboundGuidance = require('../parsers/inboundGuidance');

const getInboundGuidanceBase = (api) => api.parseEndpoint(parseInboundGuidance);
const getInboundGuidanceForASIN = (api) => getInboundGuidanceBase(api)('GetInboundGuidanceForASIN');
const getInboundGuidanceForSKU = (api) => getInboundGuidanceBase(api)('GetInboundGuidanceForSKU');

// TODO: with our current system of passing functions around like this, is there a way
// that we can make a function that will determine which object is being passed in, and
// pass it to the correct API ?

module.exports = {
    getInboundGuidanceForASIN,
    getInboundGuidanceForSKU,
};
