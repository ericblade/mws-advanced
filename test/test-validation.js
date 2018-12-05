const {
    isType,
    validate,
    validateAndTransformParameters,
} = require('../lib/util/validation');
const { ValidationError } = require('../lib/errors');

describe('validators', () => {
    describe('isType', () => {
        it('unknown type passes as always valid', () => expect(isType('testtype', 'junkdata')).to.be.true);
        it('xs:int', (done) => {
            expect(isType('xs:int', 0)).to.be.true;
            expect(isType('xs:int', 1)).to.be.true;
            expect(isType('xs:int', 1000)).to.be.true;
            expect(isType('xs:int', -1)).to.be.true;
            expect(isType('xs:int', -1000)).to.be.true;
            expect(() => isType('xs:int', 0.1234)).to.throw(ValidationError);
            expect(isType('xs:int', '1234')).to.be.true;
            expect(() => isType('xs:int', 'coffee')).to.throw(ValidationError);
            expect(() => isType('xs:int', { test: 1 })).to.throw(ValidationError);
            done();
        });
        it('xs:positiveInteger', (done) => {
            expect(() => isType('xs:positiveInteger', -100)).to.throw(ValidationError);
            expect(() => isType('xs:positiveInteger', 0)).to.throw(ValidationError);
            expect(isType('xs:positiveInteger', 100)).to.be.true;
            expect(() => isType('xs:positiveInteger', 'string')).to.throw(ValidationError);
            expect(() => isType('xs:positiveInteger', { test: true })).to.throw(ValidationError);
            done();
        });
        it('xs:nonNegativeInteger', (done) => {
            expect(() => isType('xs:nonNegativeInteger', -100)).to.throw(ValidationError);
            expect(isType('xs:nonNegativeInteger', 0)).to.be.true;
            expect(isType('xs:nonNegativeInteger', 100)).to.be.true;
            expect(() => isType('xs:nonNegativeInteger', 'string')).to.throw(ValidationError);
            expect(() => isType('xs:nonNegativeInteger', { test: true })).to.throw(ValidationError);
            done();
        });
        it('integer ranging', (done) => {
            const range = { minValue: 10, maxValue: 100 };
            expect(() => isType('xs:int', 1, range)).to.throw(ValidationError);
            expect(() => isType('xs:positiveInteger', 1, range)).to.throw(ValidationError);
            expect(() => isType('xs:nonNegativeInteger', 1, range)).to.throw(ValidationError);
            expect(isType('xs:int', 50, range)).to.be.true;
            expect(isType('xs:positiveInteger', 50, range)).to.be.true;
            expect(isType('xs:nonNegativeInteger', 50, range)).to.be.true;
            expect(() => isType('xs:int', 1000, range)).to.throw(ValidationError);
            expect(() => isType('xs:positiveInteger', 1000, range)).to.throw(ValidationError);
            expect(() => isType('xs:nonNegativeInteger', 1000, range)).to.throw(ValidationError);
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
            expect(() => isType('xs:string', 'test3', allowed)).to.throw(ValidationError);
            expect(isType('xs:positiveInteger', 2, allowed)).to.be.true;
            expect(isType('xs:nonNegativeInteger', 3, allowed)).to.be.true;
            expect(() => isType('xs:positiveInteger', 100, allowed)).to.throw(ValidationError);
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
            it('required parameter not present throws', () => expect(() => validateAndTransformParameters(req, { NotReqTest: 'test' })).to.throw(ValidationError));
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
            it('throws on non-Arrays', () => expect(() => validateAndTransformParameters(listTest, { ListTest: 'oops' })).to.throw(ValidationError));
            it('throws on incorrect list data types', () => expect(() => validateAndTransformParameters(listTest, { ListTest: [123] })).to.throw(ValidationError));
            it('throws on partial incorrect list data types', () => expect(() => validateAndTransformParameters(listTest, { ListTest: ['a', 1] })).to.throw(ValidationError));
            it('throws on exceeding listMax items', () => expect(() => validateAndTransformParameters(listTest, { ListTest: ['1', '2', '3'] })).to.throw(ValidationError));
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
});
