// no-extraneous-dependencies would force us to put chai as a non-dev dep
// no-undef breaks the standard pattern with chai, apparently
// no-unused-expressions also breaks standard chai patterns
// remove prefer-destructuring here because for some reason eslint is failing to handle it with require()
// remove prefer-arrow-function because we need to use regular functions in places to access this.skip()

/* eslint-disable import/no-extraneous-dependencies,no-undef,no-unused-expressions,prefer-destructuring,prefer-arrow-callback,global-require,no-empty,func-names,arrow-body-style */

process.env.NODE_ENV = 'testing';

const fs = require('fs'); // yes i know i probably shouldn't be writing files in tests. sorry.

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const sleep = require('../lib/util/sleep');
const isType = require('../lib/util/validation').isType;
const validate = require('../lib/util/validation').validate;
const validateAndTransformParameters = require('../lib/util/validation').validateAndTransformParameters;
const flattenResult = require('../lib/util/flatten-result').flattenResult;
const { digResponseResult } = require('../lib/util/dig-response-result');

const listMarketplacesData = require('./ListMarketplaces.json');
const errorData = require('./errorData.json');

const transformers = require('../lib/util/transformers');

const errors = require('../lib/errors');

describe('Sanity', () => {
    it('true is true', (done) => {
        expect(true).to.equal(true);
        done();
    });
});

describe('Misc Utils', () => {
    it('sleep() 1sec works', async () => {
        const startDate = Date.now();
        await sleep(1000);
        expect(Date.now() - startDate).to.be.approximately(1000, 100, 'slept for 1sec');
    });
    // TODO: we should test flattenResult using actual amazon data
    // as well, to validate real world usage.
    it('flattenResult returns array when given array', (done) => {
        const result = flattenResult([{ test: 1, test2: 2 }]);
        expect(result).to.be.an('array').with.lengthOf(1);
        expect(result[0]).to.deep.equal({ test: 1, test2: 2 });
        done();
    });
    it('flattenResult returns object when given object', () => {
        const result = flattenResult({ test: 1, test2: 2 });
        return expect(result).to.deep.equal({ test: 1, test2: 2 });
    });
    it('flattenResult() returns flat results', (done) => {
        const result = flattenResult({
            test: ['test'],
            test2: ['test2-a', 'test2-b'],
            test3: [
                {
                    test4: ['test4-a'],
                    test5: ['test5-a', 'test5-b'],
                },
            ],
        });
        expect(result).to.be.an('object');
        expect(result).to.include.all.keys(
            'test',
            'test2',
            'test3',
        );
        expect(result.test).to.equal('test');
        expect(result.test2).to.have.lengthOf(2);
        expect(result.test3).to.be.an('object').include.all.keys(
            'test4',
            'test5',
        );
        expect(result.test3.test4).to.equal('test4-a');
        expect(result.test3.test5).to.have.lengthOf(2);

        done();
    });
    it('digResponseResult() returns nameResponse.nameResult', () => {
        const result = digResponseResult('ListMarketplaceParticipations', listMarketplacesData);
        return expect(result).to.be.an('object').that.has.keys('ListParticipations', 'ListMarketplaces');
    });
    it('digResponseResult() throws ServiceError on error message (simulated from server)', () => {
        return expect(() => digResponseResult('ListMarketplaceParticipations', errorData)).to.throw(errors.ServiceError);
    });
    it('digResponseResult() returns original input if there is no {name}Response field or ErrorResponse', () => {
        const result = digResponseResult('test', { xyz: 1 });
        return expect(result).to.deep.equal({ xyz: 1 });
    });
});

describe('transformers', () => {
    describe('forceArray', () => {
        const forceArray = transformers.forceArray;
        it('returns empty array for undefined', () => {
            expect(forceArray()).to.be.an('Array').with.lengthOf(0);
        });
        it('returns array with passed parameter inside for non-array values', () => {
            expect(forceArray(0)).to.be.an('Array').with.lengthOf(1);
            expect(forceArray('test')).to.be.an('Array').with.lengthOf(1);
            expect(forceArray({ obj: 'test' })).to.be.an('Array').with.lengthOf(1);
            return true;
        });
        it('returns a copy of array passed in', () => {
            const x = ['test1', 'test2'];
            const y = forceArray(x);
            expect(y).to.not.equal(x);
            expect(y).to.deep.equal(x);
            return true;
        });
    });
    describe('isUpperCase', () => {
        it('returns true for ABCD', () => {
            expect(transformers.isUpperCase('ABCD')).to.be.true;
            return true;
        });
        it('returns false for abcd', () => {
            expect(transformers.isUpperCase('abcd')).to.be.false;
            return true;
        });
        it('returns false for AbCd', () => {
            expect(transformers.isUpperCase('AbCd')).to.be.false;
        });
    });
    describe('camelize', () => {
        it('returns camelCase strings', () => {
            expect(transformers.camelize('PascalCase')).to.equal('pascalCase');
            expect(transformers.camelize('camelCase')).to.equal('camelCase');
            return true;
        });
    });
    describe('subObjUpLevel', () => {
        const test = {
            a: 'b',
            c: {
                d: 0,
                e: 1,
            },
        };
        it('moves a sub-object down a level', () => {
            const x = transformers.subObjUpLevel('c', test);
            const y = transformers.subObjUpLevel.bind(null, 'c', test);
            expect(x).to.be.an('Object').with.all.keys('a', 'd', 'e');
            expect(y).to.not.change(test, 'c');
            return true;
        });
        it('returns a copy of original object when key is not found', () => {
            expect(transformers.subObjUpLevel('junk', test)).to.deep.equal(test);
            return true;
        });
    });
    describe('objToValueSub', () => {
        it('works', () => {
            const test = {
                _: '0.20',
                $: {
                    units: 'inches',
                },
            };
            const x = transformers.objToValueSub(test);
            return expect(x).to.deep.equal({
                value: '0.20',
                units: 'inches',
            });
        });
    });
    describe('transformKey', () => {
        it('returns camelCase strings', () => {
            expect(transformers.transformKey('PascalCase')).to.equal('pascalCase');
            expect(transformers.transformKey('camelCase')).to.equal('camelCase');
            return true;
        });
        it('returns input when given probable acronym (UPPERCASE)', () => {
            return expect(transformers.transformKey('UPPERCASE')).to.equal('UPPERCASE');
        });
    });
    describe('removeFromString', () => {
        it('returns a string minus a substring', () => {
            return expect(transformers.removeFromString('testString', 'String')).to.equal('test');
        });
        it('returns a string minus a regex pattern', () => {
            return expect(transformers.removeFromString('testString', /^test/)).to.equal('String');
        });
    });
    describe('transformAttributeSetKey', () => {
        it('extends transformKey to remove "ns2:" from beginning of key, ns2:ItemAttributes=>itemAttributes', () => {
            return expect(transformers.transformAttributeSetKey('ns2:ItemAttributes')).to.equal('itemAttributes');
        });
    });
    describe('transformObjectKeys', () => {
        it('simple test with getMarketplaces data', (done) => {
            const testData = require('./data/transformObjectKeys-1.json');
            /* eslint-disable dot-notation */
            const res = transformers.transformObjectKeys(testData)['ATVPDKIKX0DER'];
            const comp = testData['ATVPDKIKX0DER'];
            /* eslint-enable dot-notation */
            expect(comp.MarketplaceId).to.equal(res.marketplaceId);
            expect(comp.DefaultCountryCode).to.equal(res.defaultCountryCode);
            expect(comp.DomainName).to.equal(res.domainName);
            expect(comp.Name).to.equal(res.name);
            expect(comp.DefaultCurrencyCode).to.equal(res.defaultCurrencyCode);
            expect(comp.DefaultLanguageCode).to.equal(res.defaultLanguageCode);
            expect(comp.SellerId).to.equal(res.sellerId);
            expect(comp.HasSellerSuspendedListings).to.equal(res.hasSellerSuspendedListings);
            done();
        });
        it('extended test with getMatchingProductForId attribute data, using transformAttributeSetKey, test ns2:MaterialType => materialType', (done) => {
            const testData = require('./data/transformObjectKeys-2.json');
            const res = transformers.transformObjectKeys(testData, transformers.transformAttributeSetKey);
            testData.forEach((x, i) => {
                expect(x.AttributeSets['ns2:ItemAttributes']['ns2:MaterialType']).to.deep.equal(res[i].attributeSets.itemAttributes.materialType);
            });
            done();
        });
        // TODO: write detailed tests for transformObjectKeys.
        // TODO: should grab actual data from the base API and compare it.
    });
});

describe('isType', () => {
    it('unknown type passes as always valid', () => expect(isType('testtype', 'junkdata')).to.be.true);
    it('xs:int', (done) => {
        expect(isType('xs:int', 0)).to.be.true;
        expect(isType('xs:int', 1)).to.be.true;
        expect(isType('xs:int', 1000)).to.be.true;
        expect(isType('xs:int', -1)).to.be.true;
        expect(isType('xs:int', -1000)).to.be.true;
        expect(() => isType('xs:int', 0.1234)).to.throw(errors.ValidationError);
        expect(isType('xs:int', '1234')).to.be.true;
        expect(() => isType('xs:int', 'coffee')).to.throw(errors.ValidationError);
        expect(() => isType('xs:int', { test: 1 })).to.throw(errors.ValidationError);
        done();
    });
    it('xs:positiveInteger', (done) => {
        expect(() => isType('xs:positiveInteger', -100)).to.throw(errors.ValidationError);
        expect(() => isType('xs:positiveInteger', 0)).to.throw(errors.ValidationError);
        expect(isType('xs:positiveInteger', 100)).to.be.true;
        expect(() => isType('xs:positiveInteger', 'string')).to.throw(errors.ValidationError);
        expect(() => isType('xs:positiveInteger', { test: true })).to.throw(errors.ValidationError);
        done();
    });
    it('xs:nonNegativeInteger', (done) => {
        expect(() => isType('xs:nonNegativeInteger', -100)).to.throw(errors.ValidationError);
        expect(isType('xs:nonNegativeInteger', 0)).to.be.true;
        expect(isType('xs:nonNegativeInteger', 100)).to.be.true;
        expect(() => isType('xs:nonNegativeInteger', 'string')).to.throw(errors.ValidationError);
        expect(() => isType('xs:nonNegativeInteger', { test: true })).to.throw(errors.ValidationError);
        done();
    });
    it('integer ranging', (done) => {
        const range = { minValue: 10, maxValue: 100 };
        expect(() => isType('xs:int', 1, range)).to.throw(errors.ValidationError);
        expect(() => isType('xs:positiveInteger', 1, range)).to.throw(errors.ValidationError);
        expect(() => isType('xs:nonNegativeInteger', 1, range)).to.throw(errors.ValidationError);
        expect(isType('xs:int', 50, range)).to.be.true;
        expect(isType('xs:positiveInteger', 50, range)).to.be.true;
        expect(isType('xs:nonNegativeInteger', 50, range)).to.be.true;
        expect(() => isType('xs:int', 1000, range)).to.throw(errors.ValidationError);
        expect(() => isType('xs:positiveInteger', 1000, range)).to.throw(errors.ValidationError);
        expect(() => isType('xs:nonNegativeInteger', 1000, range)).to.throw(errors.ValidationError);
        done();
    });
    it('xs:string accepts regular strings', () => {
        const valid = isType('xs:string', 'this is a regular string');
        return expect(valid).to.be.true;
    });
    it('xs:string accepts string objects', () => {
        const valid = isType('xs:string', String('this is a string object'));
        return expect(valid).to.be.true;
    });
    it('xs:string does not accept things that are definitely not strings', (done) => {
        expect(isType('xs:string', { test: true })).to.be.false;
        expect(isType('xs:string', 12345)).to.be.false;
        expect(isType('xs:string', new Date())).to.be.false;
        done();
    });
    it('xs:dateTime fails Date objects (validateAndTransform converts them to ISO)', () => {
        return expect(isType('xs:dateTime', new Date())).to.be.false;
    });
    it('xs:dateTime accepts ISO Strings', () => {
        return expect(isType('xs:dateTime', new Date().toISOString())).to.be.true;
    });
    it('xs:dateTime fails non-ISO strings', (done) => {
        expect(() => isType('xs:dateTime', 'string')).to.throw(RangeError); // Date constructor throws
        expect(isType('xs:dateTime', 12345)).to.be.false;
        expect(() => isType('xs:dateTime', { test: true })).to.throw(RangeError); // Date constructor throws
        done();
    });
    it('allowed values works', (done) => {
        const allowed = { values: ['test1', 'test2', 2, 3] };
        expect(isType('xs:string', 'test1', allowed)).to.be.true;
        expect(isType('xs:string', 'test2', allowed)).to.be.true;
        expect(() => isType('xs:string', 'test3', allowed)).to.throw(errors.ValidationError);
        expect(isType('xs:positiveInteger', 2, allowed)).to.be.true;
        expect(isType('xs:nonNegativeInteger', 3, allowed)).to.be.true;
        expect(() => isType('xs:positiveInteger', 100, allowed)).to.throw(errors.ValidationError);
        done();
    });
});

describe('validateAndTransformParameters', () => {
    const req = {
        ReqTest: {
            type: 'xs:string',
            required: true,
        },
        NotReqTest: {
            type: 'xs:string',
            required: false,
        },
    };
    it('called with undefined first arg returns without parsing', () => expect(validateAndTransformParameters(undefined, 123)).to.equal(123));
    it('unknown parameter throws', () => expect(() => validateAndTransformParameters(req, { BadTest: 'test' })).to.throw());
    it('incorrect type throws', () => expect(() => validateAndTransformParameters(req, { ReqTest: 123 })).to.throw());
    describe('required parameters', () => {
        it('required parameter present works', () => expect(validateAndTransformParameters(req, { ReqTest: 'test' })).to.deep.equal({ ReqTest: 'test' }));
        it('required parameter not present throws', () => expect(() => validateAndTransformParameters(req, { NotReqTest: 'test' })).to.throw(errors.ValidationError));
    });
    describe('Array to List transformation', () => {
        const listTest = {
            ListTest: {
                type: 'xs:string',
                required: true,
                list: 'Test.List',
                listMax: 2,
            },
        };
        it('throws on non-Arrays', () => expect(() => validateAndTransformParameters(listTest, { ListTest: 'oops' })).to.throw(errors.ValidationError));
        it('throws on incorrect list data types', () => expect(() => validateAndTransformParameters(listTest, { ListTest: [123] })).to.throw(errors.ValidationError));
        it('throws on partial incorrect list data types', () => expect(() => validateAndTransformParameters(listTest, { ListTest: ['a', 1] })).to.throw(errors.ValidationError));
        it('throws on exceeding listMax items', () => expect(() => validateAndTransformParameters(listTest, { ListTest: ['1', '2', '3'] })).to.throw(errors.ValidationError));
        it('outputs correct list parameters (ListTest[x] => Test.List.x+1)', () => {
            return expect(validateAndTransformParameters(listTest, { ListTest: ['1', '2'] })).to.deep.equal({
                'Test.List.1': '1',
                'Test.List.2': '2',
            });
        });
    });
});

describe('Validate amazonOrderId format', () => {
    it('validates 3-7-3 amazonOrderId format', (done) => {
        let result = validate('123-1234567-123', { stringFormat: 'amazonOrderId' });
        expect(result).to.be.true;
        result = validate('abc-def-ghi', { stringFormat: 'amazonOrderId' });
        expect(result).to.be.false;
        done();
    });
});

// TODO: a full test configuration for this function to test all possible things could be quite
// extensive, it will take some time/effort.
const generateEndpoints = require('../lib/endpoints/endpoints-utils');

describe('Endpoint Utils', () => {
    it('generateEndpoints', (done) => {
        const endpoints = generateEndpoints(
            'TestCategory',
            '2015-01-01',
            ['TestEndpoint'],
            {
                TestEndpoint: {
                    throttle: {
                        maxInFlight: 1,
                        restoreRate: 1,
                    },
                    params: {
                        TestParam: {
                            type: 'Test',
                            required: true,
                        },
                    },
                    returns: {
                        TestReturn: {
                            type: 'Test',
                            required: true,
                        },
                    },
                },
            },
        );

        expect(endpoints).to.be.an('object');
        expect(endpoints).to.include.all.keys('TestEndpoint');

        const testEndpoint = endpoints.TestEndpoint;
        expect(testEndpoint).to.be.an('object');
        expect(testEndpoint).to.include.all.keys(
            'category', 'version', 'action',
            'params', 'returns',
        );
        expect(testEndpoint.category).to.be.a('string');
        expect(testEndpoint.version).to.be.a('string');
        expect(testEndpoint.action).to.be.a('string');

        const endpointParams = testEndpoint.params;
        expect(endpointParams).to.be.an('object');
        expect(endpointParams).to.include.all.keys('TestParam');
        const testParam = endpointParams.TestParam;
        expect(testParam).to.be.an('object');
        expect(testParam).to.include.all.keys('type', 'required');
        expect(testParam.type).to.be.a('string');
        expect(testParam.required).to.be.a('boolean');

        const endpointReturns = testEndpoint.returns;
        expect(endpointReturns).to.be.an('object');
        expect(endpointReturns).to.include.all.keys('TestReturn');
        const testReturn = endpointReturns.TestReturn;
        expect(testReturn).to.be.an('object');
        expect(testReturn).to.include.all.keys('type', 'required');
        expect(testReturn.type).to.be.a('string');
        expect(testReturn.required).to.be.a('boolean');

        done();
    });
});

const mws = require('..');

let SkipAPITests = false;
let keys;

try {
    keys = require('./keys.json');
} catch (err) {
    keys = {
        accessKeyId: process.env.MWS_ACCESS_KEY,
        secretAccessKey: process.env.MWS_SECRET_ACCESS_KEY,
        merchantId: process.env.MWS_MERCHANT_ID,
    };
}

// TODO: can we set SkipAPITests based on the results of the first API test? if it fails, then we probably need to skip all remaining tests, as something is broken.
if (!keys || !keys.accessKeyId || !keys.secretAccessKey || !keys.merchantId) {
    SkipAPITests = true;
}


describe('mws-advanced sanity', () => {
    // TODO: write tests that test all configuration options individually, and defaults,
    // much like was just written in mws-simple
    // TODO: do we need to write a test that tests authToken if it is present?
    describe('mws.init', () => {
        const initTestParams = {
            accessKeyId: 'testKeyId',
            secretAccessKey: 'testSecret',
            merchantId: 'testMerchantId',
            authToken: 'authToken',
        };
        it('init returns a configured mws object', (done) => {
            const client = mws.init(initTestParams);
            expect(client).to.be.an('object');
            expect(client).to.include.all.keys(
                'host',
                'port',
                'accessKeyId',
                'secretAccessKey',
                'merchantId',
                'authToken',
            );
            done();
        });
        it('new mws.MWSAdvanced() works like init, but returns a separate mws instance', (done) => {
            const client = new mws.MWSAdvanced(initTestParams);
            expect(client.mws).to.be.an('object');
            expect(client.mws).to.include.all.keys(
                'host',
                'port',
                'accessKeyId',
                'secretAccessKey',
                'merchantId',
                'authToken',
            );
            done();
        });
        it('calling MWSAdvanced() without new returns a new object anyway', () => {
            return expect(mws.MWSAdvanced(initTestParams)).to.be.an('object'); // eslint-disable-line
        });
        it('init() works when called on a MWSAdvanced instance', (done) => {
            const client = new mws.MWSAdvanced();
            const x = client.init(initTestParams);
            expect(x.accessKeyId).to.equal(initTestParams.accessKeyId);
            expect(client.mws.accessKeyId).to.equal(initTestParams.accessKeyId);
            done();
        });
        it('multiple instances dont become confused at init', (done) => {
            const client1 = new mws.MWSAdvanced(initTestParams);
            const client2 = new mws.MWSAdvanced({ ...initTestParams, accessKeyId: 'Junk' });
            expect(client1.mws.accessKeyId).to.equal(initTestParams.accessKeyId);
            expect(client2.mws.accessKeyId).to.equal('Junk');
            done();
        });
        it('init can pick up environment variables for keys', (done) => {
            const oldkey = process.env.MWS_ACCESS_KEY;
            process.env.MWS_ACCESS_KEY = 'testAccessKey';
            const oldSecret = process.env.MWS_SECRET_ACCESS_KEY;
            process.env.MWS_SECRET_ACCESS_KEY = 'testSecret';
            const oldMerchant = process.env.MWS_MERCHANT_ID;
            process.env.MWS_MERCHANT_ID = 'testMerchant';
            const client = mws.init();
            expect(client.accessKeyId).to.equal('testAccessKey');
            expect(client.secretAccessKey).to.equal('testSecret');
            expect(client.merchantId).to.equal('testMerchant');
            process.env.MWS_ACCESS_KEY = oldkey;
            process.env.MWS_SECRET_ACCESS_KEY = oldSecret;
            process.env.MWS_MERCHANT_ID = oldMerchant;
            done();
        });
        it('init marketplaces', (done) => {
            let client = mws.init({ region: 'CN', marketplace: 'CN' });
            expect(client.host).to.equal('mws.amazonservices.com.cn');
            client = mws.init({ region: 'AU', marketplace: 'AU' });
            expect(client.host).to.equal('mws.amazonservices.com.au');
            client = mws.init({ region: 'JP', marketplace: 'JP' });
            expect(client.host).to.equal('mws.amazonservices.jp');
            client = mws.init({ region: 'IN', marketplace: 'IN' });
            expect(client.host).to.equal('mws.amazonservices.in');
            client = mws.init({ region: 'EU', marketplace: 'DE' });
            expect(client.host).to.equal('mws-eu.amazonservices.com');
            client = mws.init({ region: 'BR', marketplace: 'BR' });
            expect(client.host).to.equal('mws.amazonservices.com');
            client = mws.init({ region: 'NA', marketplace: 'US' });
            expect(client.host).to.equal('mws.amazonservices.com');
            done();
        });
        it('init w/ junk marketplace uses default host', (done) => {
            const client = mws.init({ region: 'TestJunk' });
            expect(client.host).to.equal('mws.amazonservices.com');
            done();
        });
    });
    describe('callEndpoint functions (requires keys)', function () {
        const testCall = 'GetMatchingProductForId';
        const testParams = {
            MarketplaceId: 'ATVPDKIKX0DER',
            IdType: 'ASIN',
            IdList: ['B005NK7VTU'],
        };
        beforeEach(function () {
            if (SkipAPITests) {
                this.skip();
            }
        });
        it('tester provided likely correct keys', (done) => {
            expect(
                keys,
                'provide a keys.json file or environment variables with accessKeyId, secretAccessKey, merchantId to test API',
            ).to.include.all.keys(
                'accessKeyId',
                'secretAccessKey',
                'merchantId',
            );
            done();
        });
        it('callEndpoint functions', () => {
            mws.init(keys);
            return expect(mws.callEndpoint(testCall, testParams)).to.be.fulfilled;
        });
        it('callEndpoint functions using new MWSAdvanced()', () => {
            const test = new mws.MWSAdvanced(keys);
            return expect(test.callEndpoint(testCall, testParams)).to.be.fulfilled;
        });
        // writing this test with an assumption that converting from a single API instance to
        // a multiple instance system could end up with access objects getting swapped.
        it('multiple instances dont become confused at callEndpoint', () => {
            const test1 = new mws.MWSAdvanced(keys);
            const test2 = new mws.MWSAdvanced({
                accessKeyId: 'testKeyId',
                secretAccessKey: 'testSecret',
                merchantId: 'testMerchantId',
                authToken: 'authToken',
            });
            return test1.callEndpoint(testCall, testParams).then((res) => {
                expect(res).to.not.be.undefined;
                return expect(test2.callEndpoint(testCall, testParams)).to.be.rejectedWith('Forbidden');
            });
        });
        it('callEndpoint saveRaw/saveParsed options', async () => {
            try {
                fs.unlinkSync('./testRaw.json');
                fs.unlinkSync('./testParsed.json');
            } catch (err) {
                //
            }
            mws.init(keys);
            await mws.callEndpoint(testCall, testParams, { noFlatten: true, saveRaw: './testRaw.json', saveParsed: './testParsed.json' });
            expect(fs.existsSync('./testRaw.json')).to.equal(true);
            expect(fs.existsSync('./testParsed.json')).to.equal(true);
            try {
                fs.unlinkSync('./testRaw.json');
                fs.unlinkSync('./testParsed.json');
            } catch (err) {
                //
            }
        });
        it('callEndpoint returnRaw option', async () => {
            mws.init(keys);
            const x = await mws.callEndpoint(testCall, testParams, { returnRaw: true });
            expect(x).to.be.an('Object');
            expect(x).to.include.all.keys('GetMatchingProductForIdResponse');
            expect(x.GetMatchingProductForIdResponse).to.include.all.keys('$', 'GetMatchingProductForIdResult', 'ResponseMetadata');
            return true;
        });
        it('callEndpoint noFlatten option', async () => {
            mws.init(keys);
            const x = await mws.callEndpoint(testCall, testParams, { noFlatten: true });
            expect(x).to.be.an('Array');
            expect(x[0]).to.include.all.keys('$', 'Products');
            return true;
        });
        it('callEndpoint throws on unknown endpoint', () => {
            return expect(mws.callEndpoint('/test/endpoint', {})).to.be.rejectedWith(errors.InvalidUsage);
        });
        it('callEndpoint throws on garbage parameters', () => {
            return expect(mws.callEndpoint('GetOrder', { junkTest: true })).to.be.rejectedWith(errors.ValidationError);
        });
    });
});

describe('Parsers', function runParserTests() {
    it('listOrderItems parser', function testListOrderItemsParser() {
        const json = JSON.parse(fs.readFileSync('./test/mock/ListOrderItems.json'));
        const parser = require('../lib/parsers/orderItems');
        const results = parser(json);
        expect(results).to.be.an('Object').and.to.include.all.keys(
            'orderId',
            'orderItems',
        );
        expect(results.orderId).to.equal('112-1275545-4224234');
        expect(results.orderItems).to.be.an('Array');
        const orderItem = results.orderItems[0];
        expect(orderItem).to.deep.equal({
            title: 'Midnight in the Garden of Good and Evil: A Savannah Story [Paperback] [1999] Berendt, John',
            ASIN: '0679751521',
            sellerSKU: 'Y3-8ZR6-ZZ9O',
            orderItemId: '25379512800154',
            productInfo: {
                numberOfItems: 1,
            },
            isGift: false,
            quantityOrdered: 0,
            quantityShipped: 0,
        });
    });
    it('getMarketplaces parser', function testGetMarketplacesParser() {
        const json = JSON.parse(fs.readFileSync('./test/mock/ListMarketplaceParticipations.json'));
        const parser = require('../lib/parsers/marketplaceData');

        const marketplaceResults = parser(json);

        expect(marketplaceResults).to.be.an('object');

        marketIds = Object.keys(marketplaceResults);
        expect(marketIds).to.have.lengthOf.above(0);

        const testMarket = marketplaceResults['ATVPDKIKX0DER']; // eslint-disable-line dot-notation
        expect(testMarket).to.include.all.keys(
            'marketplaceId', 'defaultCountryCode', 'domainName', 'name',
            'defaultCurrencyCode', 'defaultLanguageCode', 'sellerId',
            'hasSellerSuspendedListings',
        );
        return true;
    });
    it('getLowestPricedOffers', function testGetLowestPricedOffersParser() {
        const json = JSON.parse(fs.readFileSync('./test/mock/GetLowestPricedOffersForASIN.json'));
        const parser = require('../lib/parsers/lowestPricedOffers');

        const result = parser(json);

        expect(result).to.be.an('object').with.keys(
            'asin',
            'marketplace',
            'itemCondition',
            'summary',
            'lowestOffers',
        );
        const summary = result.summary;
        expect(summary).to.be.an('object').with.keys(
            'totalOfferCount',
            'numberOfOffers',
            'lowestPrices',
            'buyBoxPrices',
            'buyBoxEligibleOffers',
            'listPrice',
        );
        expect(summary.totalOfferCount).to.be.a('number');
        expect(summary.numberOfOffers).to.be.an('array');
        expect(summary.lowestPrices).to.be.an('array');
        expect(summary.buyBoxPrices).to.be.an('array');
        expect(summary.buyBoxEligibleOffers).to.be.an('array');

        expect(result.lowestOffers).to.be.an('array');
        return result;
    });
    describe('parseMatchingProduct', () => {
        const parser = require('../lib/parsers/matchingProduct');
        it('response from ListMatchingProducts with a number of products', () => {
            const json = JSON.parse(fs.readFileSync('./test/mock/ListMatchingProducts.json'));
            const result = parser(json)[0].results;
            expect(result).to.be.an('array');
            expect(result).to.have.length.greaterThan(0);
            const test = result[0];
            expect(test).to.be.an('object').that.contains.keys(
                'identifiers',
                'attributeSets',
                'relationships',
                'salesRankings',
            );
        });
        it('response from ListMatchingProducts with zero results', () => {
            const json = JSON.parse(fs.readFileSync('./test/mock/ListMatchingProducts-2.json'));
            const result = parser(json)[0].results;
            return expect(result).to.be.an('array').with.lengthOf(0);
        });
        it('single ASIN response from GetMatchingProductForId', () => {
            const json = JSON.parse(fs.readFileSync('./test/mock/GetMatchingProductForId-1.json'));
            const result = parser(json);
            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(1);
            expect(result[0]).to.be.an('object');
            expect(result[0].asin).to.equal('B005NK7VTU');
            expect(result[0].idType).to.equal('asin');
            expect(result[0].id).to.equal('B005NK7VTU');
            return result;
        });
        it('2 ASIN response from GetMatchingProductForId', () => {
            const json = JSON.parse(fs.readFileSync('./test/mock/GetMatchingProductForId-2.json'));
            const result = parser(json);
            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(2);

            return result;
        });
        it('single UPC response from GetMatcingProductForId', () => {
            const json = JSON.parse(fs.readFileSync('./test/mock/GetMatchingProductForId-3.json'));
            const result = parser(json);
            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(1);
            expect(result[0]).to.be.an('object');
            expect(result[0].upc).to.equal('020357122682');
            expect(result[0].idType).to.equal('upc');
            expect(result[0].id).to.equal('020357122682');

            return result;
        });
        // TODO: the parser doesn't currently parse these results, the receiver does. urgh!
        // it('invalid UPC response', () => {
        //     const json = JSON.parse(fs.readFileSync('./test/mock/GetMatchingProductForId-4.json'));
        //     const result = parser(json);

        //     return result;
        // });
        // it('deleted ASIN response', () => {
        //     const json = JSON.parse(fs.readFileSync('./test/mock/GetMatchingProductForId-5.json'));
        //     const result = parser(json);

        //     return result;
        // });
        // TODO: theoretically, we want to also handle duplicate ASIN errors right here, but that error occurs even higher than this. urgh!
        it('partial error response (1 asin that works, 1 that doesnt) from GetMatchingProductForId', () => {
            const json = JSON.parse(fs.readFileSync('./test/mock/GetMatchingProductForId-6.json'));
            const result = parser(json);
            expect(result).to.be.an('array');
            expect(result[0]).to.be.an('object');
            expect(result[0].asin).to.equal('B005NK7VTU');
            expect(result[1]).to.be.an('object');
            expect(result[1].asin).to.equal('B01FZRFN2C');
            expect(result[1].Error).to.be.an('object');
            return result;
        });
    });
    describe('parseFeesEstimate', () => {
        const test1 = {
            marketplaceId: 'ATVPDKIKX0DER',
            idType: 'ASIN',
            idValue: 'B002KT3XQM',
            isAmazonFulfilled: true,
            identifier: '1',
            listingPrice: {
                currencyCode: 'USD',
                amount: '0.00',
            },
            shipping: {
                currencyCode: 'USD',
                amount: '0.00',
            },
        };
        const test2 = {
            ...test1,
            identifier: '2',
            idValue: 'B00IDD9TU8',
            isAmazonFulfilled: false,
        };

        const parser = require('../lib/parsers/feesEstimate');
        it('single item parsed correctly', () => {
            const json = JSON.parse(fs.readFileSync('./test/mock/GetMyFeesEstimate-1.json'));
            const result = parser(json);
            expect(result).to.be.an('Object').that.includes.all.keys(test1.identifier);
            const testRes = result[test1.identifier];
            expect(testRes).to.be.an('Object').that.includes.all.keys('totalFees', 'time', 'detail', 'identifier', 'status');
            expect(testRes.totalFees).to.be.an('Object').that.includes.all.keys('currencyCode', 'amount');
            expect(testRes.time).to.be.a('string');
            expect(testRes.detail).to.be.an('Array');
            expect(testRes.identifier).to.be.an('Object').that.includes.all.keys('marketplaceId', 'idType', 'sellerId', 'isAmazonFulfilled', 'sellerInputIdentifier', 'idValue', 'priceToEstimateFees');
            expect(testRes.status).to.equal('Success');
            const testId = testRes.identifier;
            expect(testId.marketplaceId).to.equal(test1.marketplaceId);
            expect(testId.idType).to.equal(test1.idType);
            expect(testId.sellerId).to.be.a('string');
            expect(testId.isAmazonFulfilled).to.equal(test1.isAmazonFulfilled);
            expect(testId.sellerInputIdentifier).to.equal(test1.identifier);
            expect(testId.idValue).to.equal(test1.idValue);
            const prices = testId.priceToEstimateFees;
            expect(prices.listingPrice).to.deep.equal(test1.listingPrice);
            expect(prices.shipping).to.deep.equal(test1.shipping);
        });
        it('multiple items parsed correctly', () => {
            const json = JSON.parse(fs.readFileSync('./test/mock/GetMyFeesEstimate-2.json'));
            const result = parser(json);
            expect(result).to.be.an('Object').that.includes.all.keys(test1.identifier, test2.identifier);
            const testRes = result[test1.identifier];
            expect(testRes).to.be.an('Object').that.includes.all.keys('totalFees', 'time', 'detail', 'identifier', 'status');
            expect(testRes.totalFees).to.be.an('Object').that.includes.all.keys('currencyCode', 'amount');
            expect(testRes.time).to.be.a('string');
            expect(testRes.detail).to.be.an('Array');
            expect(testRes.identifier).to.be.an('Object').that.includes.all.keys('marketplaceId', 'idType', 'sellerId', 'isAmazonFulfilled', 'sellerInputIdentifier', 'idValue', 'priceToEstimateFees');
            expect(testRes.status).to.equal('Success');
            const testId = testRes.identifier;
            expect(testId.marketplaceId).to.equal(test1.marketplaceId);
            expect(testId.idType).to.equal(test1.idType);
            expect(testId.sellerId).to.be.a('string');
            expect(testId.isAmazonFulfilled).to.equal(test1.isAmazonFulfilled);
            expect(testId.sellerInputIdentifier).to.equal(test1.identifier);
            expect(testId.idValue).to.equal(test1.idValue);
            const prices = testId.priceToEstimateFees;
            expect(prices.listingPrice).to.deep.equal(test1.listingPrice);
            expect(prices.shipping).to.deep.equal(test1.shipping);

            const testRes2 = result[test2.identifier];
            expect(testRes2).to.be.an('Object').that.includes.all.keys('totalFees', 'time', 'detail', 'identifier', 'status');
            expect(testRes2.totalFees).to.be.an('Object').that.includes.all.keys('currencyCode', 'amount');
            expect(testRes2.time).to.be.a('string');
            expect(testRes2.detail).to.be.an('Array');
            expect(testRes2.identifier).to.be.an('Object').that.includes.all.keys('marketplaceId', 'idType', 'sellerId', 'isAmazonFulfilled', 'sellerInputIdentifier', 'idValue', 'priceToEstimateFees');
            expect(testRes2.status).to.equal('Success');
            const testId2 = testRes2.identifier;
            expect(testId2.marketplaceId).to.equal(test2.marketplaceId);
            expect(testId2.idType).to.equal(test2.idType);
            expect(testId2.sellerId).to.be.a('string');
            expect(testId2.isAmazonFulfilled).to.equal(test2.isAmazonFulfilled);
            expect(testId2.sellerInputIdentifier).to.equal(test2.identifier);
            expect(testId2.idValue).to.equal(test2.idValue);
            const prices2 = testId2.priceToEstimateFees;
            expect(prices2.listingPrice).to.deep.equal(test2.listingPrice);
            expect(prices2.shipping).to.deep.equal(test2.shipping);
        });
        it('test error handling', () => {
            const feeTest = {
                marketplaceId: 'ATVPDKIKX0DER',
                idType: 'ASIN',
                idValue: 'B0002APO1I',
                isAmazonFulfilled: true,
                listingPrice: {
                    currencyCode: 'USD',
                    amount: '0.00',
                },
                shipping: {
                    currencyCode: 'USD',
                    amount: '0.00',
                },
            };
            const json = JSON.parse(fs.readFileSync('./test/mock/GetMyFeesEstimate-3.json'));
            const res = parser(json);
            const test = res[`FBA.${feeTest.idValue}`];
            expect(test.totalFees).to.equal(undefined);
            expect(test.time).to.equal(undefined);
            expect(test.detail).to.equal(undefined);
            expect(test.identifier).to.be.an('Object');
            expect(test.identifier.isAmazonFulfilled).to.equal(true);
            expect(test.status).to.equal('ServerError');
            expect(test.error).to.be.an('Object').that.includes.all.keys('code', 'message', 'type');
            expect(test.error.code).to.equal('DataNotAvailable');
            expect(test.error.message).to.equal('Item shipping weight is not available.');
            expect(test.error.type).to.equal('Receiver');
            return res;
        });
    });
});

describe('API', function runAPITests() {
    let marketIds = [];
    let testMarketId = '';
    let orderIds = [];

    this.timeout(10000);

    beforeEach(function checkSkipAPITests() {
        if (SkipAPITests) {
            this.skip();
        } else {
            mws.init(keys);
        }
    });
    describe('Seller Category', () => {
        it('getMarketplaces', async function testGetMarketplaces() {
            const marketplaceResults = await mws.getMarketplaces();
            expect(marketplaceResults).to.be.an('object');

            marketIds = Object.keys(marketplaceResults);
            expect(marketIds).to.have.lengthOf.above(0);

            testMarketId = marketIds.includes('ATVPDKIKX0DER') ? 'ATVPDKIKX0DER' : marketIds[0];
            const testMarket = marketplaceResults[testMarketId];
            console.warn('* using test markets', marketIds);
            expect(testMarket).to.include.all.keys(
                'marketplaceId', 'defaultCountryCode', 'domainName', 'name',
                'defaultCurrencyCode', 'defaultLanguageCode', 'sellerId',
                'hasSellerSuspendedListings',
            );
            return true;
        });
    });
    describe('Order Category', () => {
        describe('listOrders / listOrderItems / getOrder', () => {
            let orderId;
            it('listOrders', async function testListOrders() {
                if (!marketIds || !marketIds.length) {
                    this.skip();
                    return false;
                }
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                const params = {
                    MarketplaceId: marketIds,
                    CreatedAfter: startDate,
                };
                const results = await mws.listOrders(params);
                expect(results).to.have.lengthOf.above(0);
                orderIds = Object.keys(results).map(order => results[order].AmazonOrderId);
                expect(orderIds).to.have.lengthOf.above(0);
                orderId = orderIds[0];
                return true;
            });
            it('listOrderItems', async function testListOrderItems() {
                if (!marketIds || !marketIds.length) {
                    this.skip();
                    return false;
                }
                const results = await mws.listOrderItems(orderId);
                return expect(results).to.be.an('Object').and.to.include.all.keys(
                    'orderId',
                    'orderItems',
                );
            });
            // TODO: we need to get a wrap on GetOrder!
            it('endpoint GetOrder', async function testGetOrder() {
                if (!orderIds || !orderIds.length) {
                    this.skip();
                    return false;
                }
                const params = {
                    AmazonOrderId: orderIds,
                };
                const results = await mws.getOrder(params);

                return results;
            });
        });
    });
    describe('Finances Category', () => {
        it('listFinancialEvents', async function testListFinancialEvents() {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const result = await mws.listFinancialEvents({ PostedAfter: startDate });
            expect(result).to.be.an('object');
            expect(result).to.have.keys(
                'ProductAdsPaymentEventList', 'RentalTransactionEventList',
                'PayWithAmazonEventList', 'ServiceFeeEventList',
                'CouponPaymentEventList', 'ServiceProviderCreditEventList',
                'SellerDealPaymentEventList', 'SellerReviewEnrollmentPaymentEventList',
                'DebtRecoveryEventList', 'ShipmentEventList', 'RetrochargeEventList',
                'SAFETReimbursementEventList', 'GuaranteeClaimEventList', 'ImagingServicesFeeEventList',
                'ChargebackEventList', 'FBALiquidationEventList', 'LoanServicingEventList',
                'RefundEventList', 'AdjustmentEventList', 'PerformanceBondRefundEventList',
            );
            return result;
        });
    });
    describe('FBA Fulfillment Inventory Category', () => {
        it('listInventorySupply', async function testListInventorySupply() {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const result = await mws.listInventorySupply({
                QueryStartDateTime: startDate,
            });
            expect(result).to.be.an('object');
            expect(result).to.contain.keys('supplyList');
            expect(result.supplyList).to.be.an('array');
            return result;
        });
    });
    describe('Products Category', () => {
        describe('listMatchingProducts', () => {
            it('listMatchingProducts better made special potato sticks original', async function testListMatchingProducts() {
                const results = await mws.listMatchingProducts({
                    marketplaceId: 'ATVPDKIKX0DER',
                    query: 'better made special potato sticks original',
                });
                expect(results).to.be.an('array');
                expect(results).to.have.length.greaterThan(0);
                const test = results[0];
                expect(test).to.be.an('object').that.contains.keys(
                    'identifiers',
                    'attributeSets',
                    'relationships',
                    'salesRankings',
                );
            });
            it('listMatchingProducts testjunk (expect empty response here)', async function testListMatchingProducts2() {
                const results = await mws.listMatchingProducts({
                    marketplaceId: 'ATVPDKIKX0DER',
                    query: 'testjunk',
                });
                return expect(results).to.be.an('array').with.lengthOf(0);
            });
        });
        describe('getMatchingProductForId', () => {
            // TODO: getMatchingProductForId with two duplicate ASINs throws a 400 Bad Request
            // error, which we may need to investigate special handling for.
            it('getMatchingProductForId single ASIN', async function testGetMatchingProductForId() {
                const result = await mws.getMatchingProductForId({
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU'],
                });
                expect(result).to.be.an('array');
                expect(result).to.have.lengthOf(1);
                expect(result[0]).to.be.an('object');
                expect(result[0].asin).to.equal('B005NK7VTU');
                expect(result[0].idType).to.equal('asin');
                expect(result[0].id).to.equal('B005NK7VTU');
                return result;
            });
            it('getMatchingProductForId 2 ASINs', async function testGetMatchingProductForId2() {
                const result = await mws.getMatchingProductForId({
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU', 'B00OB8EYZE'],
                });
                expect(result).to.be.an('array');
                expect(result).to.have.lengthOf(2);
                return result;
            });
            it('getMatchingProductForId single UPC', async function testGetMatchingProductForId3() {
                const result = await mws.getMatchingProductForId({
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'UPC',
                    IdList: ['020357122682'],
                });
                expect(result).to.be.an('array');
                expect(result).to.have.lengthOf(1);
                expect(result[0]).to.be.an('object');
                expect(result[0].upc).to.equal('020357122682');
                expect(result[0].idType).to.equal('upc');
                expect(result[0].id).to.equal('020357122682');
                return result;
            });
            it('getMatchingProductForId with invalid UPC', function testGetMatchingProductForId4() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'UPC',
                    IdList: ['012345678900'],
                };
                // Error: {"Type":"Sender","Code":"InvalidParameterValue","Message":"Invalid UPC identifier 000000000000 for marketplace ATVPDKIKX0DER"}
                return expect(mws.getMatchingProductForId(params)).to.be.rejectedWith(errors.ServiceError);
            });
            it('getMatchingProductForId with ASIN that has been deleted', async function testGetMatchingProductForId5() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B01FZRFN2C'],
                };
                return expect(mws.getMatchingProductForId(params)).to.be.rejectedWith(errors.ServiceError);
            });
            // oddly, the Amazon API throws Error 400 from the server if you give it duplicate items, instead of ignoring dupes or throwing individual errors, or returning multiple copies.
            it('getMatchingProductForId with duplicate ASINs in list', async function testGetMatchingProductForId6() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU', 'B00OB8EYZE', 'B005NK7VTU', 'B00OB8EYZE'],
                };
                return expect(mws.getMatchingProductForId(params)).to.be.rejectedWith(mws.ServiceError);
            });
            it('getMatchingProductForId with partial error (1 asin that works, 1 that doesnt)', async function testGetMatchingProductForId7() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    IdType: 'ASIN',
                    IdList: ['B005NK7VTU', 'B01FZRFN2C'],
                };
                const result = await mws.getMatchingProductForId(params);
                expect(result).to.be.an('array');
                expect(result[0]).to.be.an('object');
                expect(result[0].asin).to.equal('B005NK7VTU');
                expect(result[1]).to.be.an('object');
                expect(result[1].asin).to.equal('B01FZRFN2C');
                expect(result[1].Error).to.be.an('object');
                return true;
            });
        });
        describe('getLowestPricedOffers', () => {
            it('getLowestPricedOffersForSKU', function () {
                // console.warn('* test for getLowestPricedOffersForSKU not yet implemented, requires fetching a valid SellerSKU');
                this.skip();
                return false;
            });
            it('getLowestPricedOffersForASIN', async function testGetLowestPricedOffersForASIN() {
                const params = {
                    MarketplaceId: 'ATVPDKIKX0DER',
                    ASIN: 'B010YSIKKY',
                    ItemCondition: 'New',
                };
                const result = await mws.getLowestPricedOffersForASIN(params);
                expect(result).to.be.an('object').with.keys(
                    'asin',
                    'marketplace',
                    'itemCondition',
                    'summary',
                    'lowestOffers',
                );
                const summary = result.summary;
                expect(summary).to.be.an('object').with.keys(
                    'totalOfferCount',
                    'numberOfOffers',
                    'lowestPrices',
                    'buyBoxPrices',
                    'buyBoxEligibleOffers',
                    'listPrice',
                );
                expect(summary.totalOfferCount).to.be.a('number');
                expect(summary.numberOfOffers).to.be.an('array');
                expect(summary.lowestPrices).to.be.an('array');
                expect(summary.buyBoxPrices).to.be.an('array');
                expect(summary.buyBoxEligibleOffers).to.be.an('array');

                expect(result.lowestOffers).to.be.an('array');
                return result;
            });
        });
        describe('getProductCategories*', () => {
            it('getProductCategoriesForAsins returns single result', async function testCategoriesAsins() {
                const result = await mws.getProductCategoriesForAsins({
                    marketplaceId: 'ATVPDKIKX0DER',
                    asins: ['B00IDD9TU8'],
                });
                expect(result).to.be.an('Array').with.lengthOf(1);
                expect(result[0]).to.include.all.keys('asin', 'Self');
                expect(result[0].asin).to.equal('B00IDD9TU8');
            });
            it('getProductCategoriesForAsins returns multiple results', async function testCategoriesAsins2() {
                const result = await mws.getProductCategoriesForAsins({
                    marketplaceId: 'ATVPDKIKX0DER',
                    asins: ['B00IDD9TU8', 'B00IH00CN0'],
                });
                expect(result).to.be.an('Array').with.lengthOf(2);
                expect(result[0]).to.include.all.keys('asin', 'Self');
                expect(result[0].asin).to.equal('B00IDD9TU8');
                expect(result[1]).to.include.all.keys('asin', 'Self');
                expect(result[1].asin).to.equal('B00IH00CN0');
            });
            // TODO: figure out some function we can use to query some valid skus to use
            // TODO: we should test error conditions for getProductCategories*, however, throwing up
            // invalid ASINs comes up with potentially several different results:
            // 1- no category returned, no error
            // 2- error 400, "invalid ASIN for marketplace (x)",
            // 3- error 500, "Server Error"
            it.skip('getProductCategoriesForSkus', 'unable to test skus without first querying skus');
        });
        describe('getMyFeesEstimate', () => {
            const test1 = {
                marketplaceId: 'ATVPDKIKX0DER',
                idType: 'ASIN',
                idValue: 'B002KT3XQM',
                isAmazonFulfilled: true,
                identifier: '1',
                listingPrice: {
                    currencyCode: 'USD',
                    amount: '0.00',
                },
                shipping: {
                    currencyCode: 'USD',
                    amount: '0.00',
                },
            };
            const test2 = {
                ...test1,
                identifier: '2',
                idValue: 'B00IDD9TU8',
                isAmazonFulfilled: false,
            };

            // TODO: write tests for potential failure conditions, make sure code handles them as expected
            // TODO: write a function to compare (input [test1/test2] and output [testRes, testRes2]) so that code isn't so needlessly duplicated
            it('getMyFeesEstimate returns object indexed by request Identifier', async function testFeesSingle() {
                const result = await mws.getMyFeesEstimate([test1]);
                expect(result).to.be.an('Object').that.includes.all.keys(test1.identifier);
                const testRes = result[test1.identifier];
                expect(testRes).to.be.an('Object').that.includes.all.keys('totalFees', 'time', 'detail', 'identifier', 'status');
                expect(testRes.totalFees).to.be.an('Object').that.includes.all.keys('currencyCode', 'amount');
                expect(testRes.time).to.be.a('string');
                expect(testRes.detail).to.be.an('Array');
                expect(testRes.identifier).to.be.an('Object').that.includes.all.keys('marketplaceId', 'idType', 'sellerId', 'isAmazonFulfilled', 'sellerInputIdentifier', 'idValue', 'priceToEstimateFees');
                expect(testRes.status).to.equal('Success');
                const testId = testRes.identifier;
                expect(testId.marketplaceId).to.equal(test1.marketplaceId);
                expect(testId.idType).to.equal(test1.idType);
                expect(testId.sellerId).to.be.a('string');
                expect(testId.isAmazonFulfilled).to.equal(test1.isAmazonFulfilled);
                expect(testId.sellerInputIdentifier).to.equal(test1.identifier);
                expect(testId.idValue).to.equal(test1.idValue);
                const prices = testId.priceToEstimateFees;
                expect(prices.listingPrice).to.deep.equal(test1.listingPrice);
                expect(prices.shipping).to.deep.equal(test1.shipping);
            });
            it('getMyFeesEstimate returns correctly for multiple items', async function testFeesMultiple() {
                const result = await mws.getMyFeesEstimate([test1, test2]);
                expect(result).to.be.an('Object').that.includes.all.keys(test1.identifier, test2.identifier);
                const testRes = result[test1.identifier];
                expect(testRes).to.be.an('Object').that.includes.all.keys('totalFees', 'time', 'detail', 'identifier', 'status');
                expect(testRes.totalFees).to.be.an('Object').that.includes.all.keys('currencyCode', 'amount');
                expect(testRes.time).to.be.a('string');
                expect(testRes.detail).to.be.an('Array');
                expect(testRes.identifier).to.be.an('Object').that.includes.all.keys('marketplaceId', 'idType', 'sellerId', 'isAmazonFulfilled', 'sellerInputIdentifier', 'idValue', 'priceToEstimateFees');
                expect(testRes.status).to.equal('Success');
                const testId = testRes.identifier;
                expect(testId.marketplaceId).to.equal(test1.marketplaceId);
                expect(testId.idType).to.equal(test1.idType);
                expect(testId.sellerId).to.be.a('string');
                expect(testId.isAmazonFulfilled).to.equal(test1.isAmazonFulfilled);
                expect(testId.sellerInputIdentifier).to.equal(test1.identifier);
                expect(testId.idValue).to.equal(test1.idValue);
                const prices = testId.priceToEstimateFees;
                expect(prices.listingPrice).to.deep.equal(test1.listingPrice);
                expect(prices.shipping).to.deep.equal(test1.shipping);

                const testRes2 = result[test2.identifier];
                expect(testRes2).to.be.an('Object').that.includes.all.keys('totalFees', 'time', 'detail', 'identifier', 'status');
                expect(testRes2.totalFees).to.be.an('Object').that.includes.all.keys('currencyCode', 'amount');
                expect(testRes2.time).to.be.a('string');
                expect(testRes2.detail).to.be.an('Array');
                expect(testRes2.identifier).to.be.an('Object').that.includes.all.keys('marketplaceId', 'idType', 'sellerId', 'isAmazonFulfilled', 'sellerInputIdentifier', 'idValue', 'priceToEstimateFees');
                expect(testRes2.status).to.equal('Success');
                const testId2 = testRes2.identifier;
                expect(testId2.marketplaceId).to.equal(test2.marketplaceId);
                expect(testId2.idType).to.equal(test2.idType);
                expect(testId2.sellerId).to.be.a('string');
                expect(testId2.isAmazonFulfilled).to.equal(test2.isAmazonFulfilled);
                expect(testId2.sellerInputIdentifier).to.equal(test2.identifier);
                expect(testId2.idValue).to.equal(test2.idValue);
                const prices2 = testId2.priceToEstimateFees;
                expect(prices2.listingPrice).to.deep.equal(test2.listingPrice);
                expect(prices2.shipping).to.deep.equal(test2.shipping);
            });
            it('getMyFeesEstimate error handling', async function testFeesErrors() {
                const feeTest = {
                    marketplaceId: 'ATVPDKIKX0DER',
                    idType: 'ASIN',
                    idValue: 'B0002APO1I',
                    isAmazonFulfilled: true,
                    listingPrice: {
                        currencyCode: 'USD',
                        amount: '0.00',
                    },
                    shipping: {
                        currencyCode: 'USD',
                        amount: '0.00',
                    },
                };
                const res = await mws.getMyFeesEstimate([feeTest]);
                const test = res[`FBA.${feeTest.idValue}`];
                expect(test.totalFees).to.equal(undefined);
                expect(test.time).to.equal(undefined);
                expect(test.detail).to.equal(undefined);
                expect(test.identifier).to.be.an('Object');
                expect(test.identifier.isAmazonFulfilled).to.equal(true);
                expect(test.status).to.equal('ServerError');
                expect(test.error).to.be.an('Object').that.includes.all.keys('code', 'message', 'type');
                expect(test.error.code).to.equal('DataNotAvailable');
                expect(test.error.message).to.equal('Item shipping weight is not available.');
                expect(test.error.type).to.equal('Receiver');
                return res;
            });
        });
    });

    describe('Reports Category', () => {
        let reportList = [];
        let ReportRequestId = null;
        it('requestReport', async function () {
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests (set env REPORTS_TESTS=true to perform)');
                this.skip();
                return false;
            }
            const report = await mws.requestReport({
                ReportType: '_GET_V1_SELLER_PERFORMANCE_REPORT_',
            });
            expect(report).to.be.an('object').with.keys(
                'ReportType',
                'ReportProcessingStatus',
                'EndDate',
                'Scheduled',
                'ReportRequestId',
                'SubmittedDate',
                'StartDate',
            );
            ({ ReportRequestId } = report);
            console.warn('* setting future report request id to', ReportRequestId);
            return true;
        });
        it('getReportRequestList (timeout disabled, retries until status shows a done or cancelled state)', async function testGetReportRequestList() {
            if (!ReportRequestId) {
                this.skip();
                return false;
            }
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests');
                this.skip();
                return false;
            }
            this.timeout(0);
            let reportComplete = false;
            let list;
            while (!reportComplete) {
                // eslint-disable-next-line no-await-in-loop
                list = await mws.getReportRequestList({
                    ReportRequestIdList: [ReportRequestId],
                });
                const status = list.ReportProcessingStatus;
                if (status !== '_SUBMITTED_' && status !== '_IN_PROGRESS_') {
                    reportComplete = true;
                } else {
                    // eslint-disable-next-line no-await-in-loop
                    await sleep(30000);
                }
            }
            return true;
        });
        it('getReportListAll', async function testGetReportListAll() {
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests');
                this.skip();
                return false;
            }
            reportList = await mws.getReportListAll({
                ReportTypeList: ['_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_'],
            });
            expect(reportList).to.be.an('array');
            expect(reportList).to.have.lengthOf.above(0);
            return reportList;
        });
        it('getReport', async function testGetReport() {
            if (!reportList || !reportList.length) {
                this.skip();
                return false;
            }
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests');
                this.skip();
                return false;
            }

            const report = await mws.getReport({
                ReportId: reportList[0].ReportId,
            });
            fs.writeFileSync('settlement.json', JSON.stringify(report, null, 4));
            expect(report).to.be.an('array');
            expect(report).to.have.lengthOf.above(0);
            const settlement = report[0];
            expect(settlement).to.include.all.keys(
                'settlement-id', 'settlement-start-date', 'settlement-end-date',
                'deposit-date', 'total-amount', 'currency',
            );
            const amount = parseFloat(settlement['total-amount']);
            expect(amount).to.be.a('number');
            console.warn(`* Found settlement of ${amount}`);
            return settlement;
        });
        it('requestAndDownloadReport (timeout 120sec)', async function testRequestDownloadReport() {
            if (!process.env.REPORTS_TESTS) {
                console.warn('* skipping reports tests');
                this.skip();
                return false;
            }
            this.timeout(120 * 1000);
            await mws.requestAndDownloadReport('_GET_FLAT_FILE_OPEN_LISTINGS_DATA_', './test-listings.json');
            expect(fs.existsSync('./test-listings.json')).to.equal(true);
            try {
                fs.unlinkSync('./test-listings.json');
            } catch (err) {
                //
            }
            return true;
        });
    });
});
