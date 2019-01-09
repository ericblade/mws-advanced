process.env.NODE_ENV = 'testing';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

global.expect = chai.expect;

let SkipAPITests = false;
let MWSAPIKeys;

try {
    MWSAPIKeys = require('./keys.json');
} catch (err) {
    MWSAPIKeys = {
        accessKeyId: process.env.MWS_ACCESS_KEY,
        secretAccessKey: process.env.MWS_SECRET_ACCESS_KEY,
        merchantId: process.env.MWS_MERCHANT_ID,
    };
}

// TODO: can we set SkipAPITests based on the results of the first API test? if it fails, then we probably need to skip all remaining tests, as something is broken.
if (!MWSAPIKeys || !MWSAPIKeys.accessKeyId || !MWSAPIKeys.secretAccessKey || !MWSAPIKeys.merchantId) {
    SkipAPITests = true;
}

global.SkipAPITests = SkipAPITests;
global.MWSAPIKeys = MWSAPIKeys;
