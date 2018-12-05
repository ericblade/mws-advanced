const sleep = require('../lib/util/sleep');
const { flattenResult } = require('../lib/util/flatten-result');
const { digResponseResult } = require('../lib/util/dig-response-result');
const listMarketplacesData = require('./ListMarketplaces.json');
const errorData = require('./errorData.json');
const { ServiceError } = require('../lib/errors');
const generateEndpoints = require('../lib/endpoints/endpoints-utils');


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
        return expect(result).to.be.an('object')
            .that.has.keys('ListParticipations', 'ListMarketplaces');
    });
    it('digResponseResult() throws ServiceError on error message (simulated from server)', () => {
        return expect(() => digResponseResult('ListMarketplaceParticipations', errorData))
            .to.throw(ServiceError);
    });
    it('digResponseResult() returns original input if there is no {name}Response field or ErrorResponse', () => {
        const result = digResponseResult('test', { xyz: 1 });
        return expect(result).to.deep.equal({ xyz: 1 });
    });

    // TODO: a full test configuration for this function to test all possible things could be quite
    // extensive, it will take some time/effort.
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
});
