/* eslint-disable max-len */

const fs = require('fs');

describe('Parsers', function runParserTests() {
    describe('inbound guidance parsers', () => {
        const parser = require('../lib/parsers/inboundGuidance');
        const invalidAsin1 = { ASIN: 'testAsin1', ErrorReason: 'testError1' };
        const invalidAsin2 = { ASIN: 'testAsin2', ErrorReason: 'testError2' };
        const invalidAsinList = { InvalidASIN: [invalidAsin1, invalidAsin2] };
        const invalidSku1 = { SellerSKU: 'testSku1', ErrorReason: 'testError1' };
        const invalidSku2 = { SellerSKU: 'testSku2', ErrorReason: 'testError2' };
        const invalidSkuList = { InvalidSKU: [invalidSku1, invalidSku2] };
        const guidanceReasonList = { GuidanceReason: 'NoApplicableGuidance' };
        const inboundGuidance = {
            GuidanceReasonList: guidanceReasonList,
            ASIN: 'testAsin',
            SellerSKU: 'testSku',
            InboundGuidance: 'InboundOK',
        };
        const asinInboundGuidanceList = {
            ASINInboundGuidance: [inboundGuidance],
        };
        const skuInboundGuidanceList = {
            SKUInboundGuidance: [inboundGuidance],
        };

        it('parseInvalidAsin', () => {
            const result = parser.parseInvalidAsin(invalidAsin1);
            expect(result).to.be.an('object').with.keys(['asin', 'error']);
            expect(result.asin).to.equal('testAsin1');
            expect(result.error).to.equal('testError1');
        });
        it('parseInvalidAsinList', () => {
            const result = parser.parseInvalidAsinList(invalidAsinList);
            expect(result).to.be.an('array').with.lengthOf(2);
            expect(result[0]).to.be.an('object').that.deep.equals({ asin: 'testAsin1', error: 'testError1' });
            expect(result[1]).to.be.an('object').that.deep.equals({ asin: 'testAsin2', error: 'testError2' });
        });
        it('parseInvalidSku', () => {
            const result = parser.parseInvalidSku(invalidSku1);
            expect(result).to.be.an('object').with.keys(['sku', 'error']);
            expect(result.sku).to.equal('testSku1');
            expect(result.error).to.equal('testError1');
        });
        it('parseInvalidSkuList', () => {
            const result = parser.parseInvalidSkuList(invalidSkuList);
            expect(result).to.be.an('array').with.lengthOf(2);
            expect(result[0]).to.be.an('object').that.deep.equals({ sku: 'testSku1', error: 'testError1' });
            expect(result[1]).to.be.an('object').that.deep.equals({ sku: 'testSku2', error: 'testError2' });
        });
        it('parseGuidanceReasonList', () => {
            const result = parser.parseGuidanceReasonList({ GuidanceReason: 'test guidance' });
            expect(result).to.equal('test guidance');
        });
        it('parseAsinInboundGuidance', () => {
            const result = parser.parseAsinInboundGuidance(inboundGuidance);
            expect(result).to.be.an('object').with.keys(['asin', 'guidance', 'reason']);
            expect(result.asin).to.equal('testAsin');
            expect(result.guidance).to.equal('InboundOK');
            expect(result.reason).to.equal('NoApplicableGuidance');
        });
        it('parseAsinInboundGuidanceList', () => {
            const result = parser.parseAsinInboundGuidanceList(asinInboundGuidanceList);
            expect(result).to.be.an('array').with.lengthOf(1);
            expect(result[0]).to.be.an('object').with.keys(['asin', 'guidance', 'reason']);
        });
        it('parseSkuInboundGuidance', () => {
            const result = parser.parseSkuInboundGuidance(inboundGuidance);
            expect(result).to.be.an('object').with.keys(['asin', 'sku', 'guidance', 'reason']);
            expect(result.asin).to.equal('testAsin');
            expect(result.guidance).to.equal('InboundOK');
            expect(result.reason).to.equal('NoApplicableGuidance');
            expect(result.sku).to.equal('testSku');
        });
        it('parseSkuInboundGuidanceList', () => {
            const result = parser.parseSkuInboundGuidanceList(skuInboundGuidanceList);
            expect(result).to.be.an('array').with.lengthOf(1);
            expect(result[0]).to.be.an('object').with.keys(['asin', 'sku', 'guidance', 'reason']);
        });
        it('parseAnyInboundGuidance', () => {
            const result = parser.parseAnyInboundGuidance({
                InvalidASINList: invalidAsinList,
                InvalidSKUList: invalidSkuList,
                ASINInboundGuidanceList: asinInboundGuidanceList,
                SKUInboundGuidanceList: skuInboundGuidanceList,
            });
            expect(result).to.be.an('object').that.deep.equals(
                {
                    testAsin1: { error: 'testError1' },
                    testAsin2: { error: 'testError2' },
                    testSku1: { error: 'testError1' },
                    testSku2: { error: 'testError2' },
                    testAsin:
                    {
                        guidance: 'InboundOK',
                        reason: 'NoApplicableGuidance',
                    },
                    testSku: {
                        asin: 'testAsin',
                        guidance: 'InboundOK',
                        reason: 'NoApplicableGuidance',
                    },
                },
            );
        });
    });
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

        const marketIds = Object.keys(marketplaceResults);
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
