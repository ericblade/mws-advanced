const transformers = require('../lib/util/transformers');

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
