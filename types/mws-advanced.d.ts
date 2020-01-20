declare module "constants" {
    export namespace MWS_MARKETPLACES {
        export const CA: string;
        export const MX: string;
        export const US: string;
        export const BR: string;
        export const DE: string;
        export const ES: string;
        export const FR: string;
        export const IT: string;
        export const UK: string;
        export const IN: string;
        export const CN: string;
        export const AU: string;
        export const JP: string;
        export const TR: string;
    }
    export namespace MWS_ENDPOINTS {
        export const NA: string;
        const BR_1: string;
        export { BR_1 as BR };
        export const EU: string;
        const IN_1: string;
        export { IN_1 as IN };
        const CN_1: string;
        export { CN_1 as CN };
        const AU_1: string;
        export { AU_1 as AU };
        const JP_1: string;
        export { JP_1 as JP };
    }
    export namespace MARKET_CURRENCY {
        const US_1: string;
        export { US_1 as US };
        const CA_1: string;
        export { CA_1 as CA };
    }
}
declare module "errors" {
    export class InvalidUsage extends Error {
        constructor(message?: string | undefined);
    }
    export class InvalidIdentifier extends ServiceError {
        constructor(message: any, type: any, identifier: any, marketplace: any);
        type: any;
        identifier: any;
        marketplace: any;
    }
    export class RequestCancelled extends Error {
        constructor(message?: string | undefined);
    }
    export class ServiceError extends Error {
        constructor(message: any);
    }
    export class ValidationError extends Error {
        constructor(message?: string | undefined);
    }
}
declare module "endpoints/Queue" {
    export class Queue {
        constructor({ api, category, action, maxInFlight, restoreRate, }: {
            api: any;
            category: any;
            action: any;
            maxInFlight: any;
            restoreRate: any;
        }, deleteQueueFromSchedule: any);
        api: any;
        category: any;
        action: any;
        inFlight: number;
        maxInFlight: any;
        restoreRate: any;
        onEmptyQueue: any;
        queue: any[];
        queueTimer: NodeJS.Timeout | null;
        singleDrain: boolean;
        throttle(): void;
        setThrottleTimer(): void;
        onQueueTimer(): void;
        drainQueue(): void;
        complete(): void;
        fail(err: any, failedItem: any): void;
        runQueue(): void;
        request(params: any, options: any): Promise<any>;
        throttleCalls: number;
        resetDrainTimeout: NodeJS.Timeout | undefined;
    }
    export class QueueScheduler {
        queueMap: Map<any, any>;
        getQueue(queueName: any): any;
        registerQueue(newQueue: any, queueName: any): Map<any, any>;
        deleteQueue(queueName: any): boolean;
    }
    export const QueueSchedule: QueueScheduler;
}
declare module "util/flatten-result" {
    export function flattenResult(result: any): any;
}
declare module "util/validation" {
    export function isType(type: string, test: any, definition: any): boolean;
    export function validate(test: any, definition: any): boolean;
    export function validateAndTransformParameters(valid: any, options: any): any;
}
declare module "util/dig-response-result" {
    export function digResponseResult(name: string, data: any): any;
}
declare module "endpoints/endpoints-utils" {
    export = generateEndpoints;
    function generateEndpoints(categoryName: any, version: any, endpoints: any, endpointDetails: any): any;
}
declare module "endpoints/feeds" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/finances" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/inbound" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/inventory" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/outbound" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/merch-fulfillment" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/orders" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/products" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/sellers" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/constants" {
    export const REQUEST_REPORT_TYPES: string[];
    export const SCHEDULED_REPORT_TYPES: string[];
    export const NOREQUEST_REPORT_TYPES: string[];
    export const REPORT_PROCESSING_STATUS_TYPES: string[];
    export const SCHEDULE_TYPES: string[];
}
declare module "endpoints/reports" {
    export = endpoints;
    const endpoints: any;
}
declare module "endpoints/recommendations" {
    const _exports: any;
    export = _exports;
}
declare module "endpoints/index" {
    export const feeds: any;
    export const finances: any;
    export const inbound: any;
    export const inventory: any;
    export const outbound: any;
    export const merchFulfillment: any;
    export const orders: any;
    export const products: any;
    export const sellers: any;
    export const reports: any;
    export const recommendations: any;
}
declare module "util/transformers" {
    const _exports: any;
    export = _exports;
}
declare module "parsers/inboundGuidance" {
    export = parseAnyInboundGuidance;
    function parseAnyInboundGuidance(guidance: any): {};
    namespace parseAnyInboundGuidance {
        export { MWSInvalidASIN, MWSInvalidASINList, invalidAsin, MWSInvalidSKU, invalidSku, MWSInvalidSKUList, MWSGuidanceReasonList, guidanceReason, MWSInboundGuidance, inboundGuidance, MWSASINInboundGuidance, MWSASINInboundGuidanceList, MWSSKUInboundGuidance, MWSSKUInboundGuidanceList };
    }
    type MWSInvalidASIN = {
        ASIN: string;
        ErrorReason: string;
    };
    type MWSInvalidASINList = {
        InvalidASIN: MWSInvalidASIN[];
    };
    type invalidAsin = {
        asin: string;
        error: string;
    };
    type MWSInvalidSKU = {
        SellerSKU: string;
        ErrorReason: string;
    };
    type invalidSku = {
        sku: string;
        error: string;
    };
    type MWSInvalidSKUList = {
        InvalidSKU: any[];
    };
    type MWSGuidanceReasonList = {
        GuidanceReason: string;
    };
    type guidanceReason = string;
    type MWSInboundGuidance = string;
    type inboundGuidance = {
        sku?: string;
        asin: string;
        guidance: string;
        reason: string;
    };
    type MWSASINInboundGuidance = {
        ASIN: string;
        InboundGuidence: string;
        GuidanceReasonList: MWSGuidanceReasonList;
    };
    type MWSASINInboundGuidanceList = string[];
    type MWSSKUInboundGuidance = {
        SellerSKU: string;
        ASIN: string;
        InboundGuidance: string;
        GuidanceReasonList: MWSGuidanceReasonList;
    };
    type MWSSKUInboundGuidanceList = MWSSKUInboundGuidance[];
}
declare module "helpers/getInboundGuidance" {
    export function getInboundGuidanceForASIN(api: any): any;
    export function getInboundGuidanceForSKU(api: any): any;
}
declare module "parsers/marketplaceData" {
    export = parseMarketplaceData;
    function parseMarketplaceData(marketplaceData: any): any;
}
declare module "helpers/getMarketplaces" {
    export = getMarketplaces;
    function getMarketplaces(api: any): any;
}
declare module "helpers/listOrders" {
    export = listOrders;
    function listOrders(api: any): any;
}
declare module "parsers/orderItems" {
    export = parseOrderItems;
    function parseOrderItems(orderItemsList: any): any;
    namespace parseOrderItems {
        export { OrderItem, OrderItemsList, orderItemsList };
    }
    type OrderItem = any;
    type OrderItemsList = any;
    type orderItemsList = any;
}
declare module "helpers/listOrderItems" {
    export = listOrderItems;
    function listOrderItems(api: any): any;
    namespace listOrderItems {
        export { OrderItemList };
    }
    type OrderItemList = any;
}
declare module "helpers/getOrder" {
    export = getOrder;
    function getOrder(api: any): any;
}
declare module "helpers/listFinancialEvents" {
    export = listFinancialEvents;
    function listFinancialEvents(api: any): any;
}
declare module "helpers/listInventorySupply" {
    export = listInventorySupply;
    function listInventorySupply(api: any): any;
}
declare module "parsers/matchingProduct" {
    export = parseMatchingProduct;
    function parseMatchingProduct(productData: any): any[];
    namespace parseMatchingProduct {
        export { ProductIdentifier };
    }
    type ProductIdentifier = any;
}
declare module "helpers/listMatchingProducts" {
    export = listMatchingProducts;
    function listMatchingProducts(api: any): any;
}
declare module "helpers/getMatchingProduct" {
    export = getMatchingProductForId;
    function getMatchingProductForId(api: any): any;
}
declare module "parsers/lowestPricedOffers" {
    export = parseLowestPricedOffers;
    function parseLowestPricedOffers(offerData: any): {
        asin: any;
        marketplace: any;
        itemCondition: any;
        summary: any;
        lowestOffers: any;
    };
    namespace parseLowestPricedOffers {
        export { LowestPricedOffers, OfferCount, SellerFeedbackRating, DetailedShippingTime, Money, ShipsFrom, Offer, LowestPrice, BuyBoxPrice, OfferSummary };
    }
    type LowestPricedOffers = any;
    type OfferCount = any;
    type SellerFeedbackRating = any;
    type DetailedShippingTime = any;
    type Money = any;
    type ShipsFrom = any;
    type Offer = any;
    type LowestPrice = any;
    type BuyBoxPrice = any;
    type OfferSummary = any;
}
declare module "helpers/getLowestPricedOffers" {
    export function getLowestPricedOffersForASIN(api: any): any;
    export function getLowestPricedOffersForSKU(api: any): any;
}
declare module "helpers/getProductCategories" {
    export type productCategory = any;
    export type productCategoryByAsin = any;
    export type productCategoryBySku = any;
    export function getProductCategoriesForAsins(api: any): ({ marketplaceId, asins }: {
        marketplaceId: any;
        asins: any;
    }) => Promise<[any, any, any, any, any, any, any, any, any, any]>;
    export function getProductCategoriesForSkus(api: any): ({ marketplaceId, skus }: {
        marketplaceId: any;
        skus: any;
    }) => Promise<[any, any, any, any, any, any, any, any, any, any]>;
}
declare module "parsers/feesEstimate" {
    export = parseFeesEstimate;
    function parseFeesEstimate(fees: any): any;
}
declare module "helpers/getMyFeesEstimate" {
    export = getMyFeesEstimate;
    function getMyFeesEstimate(api: any): any;
    namespace getMyFeesEstimate {
        export { EstimateRequest, FeeDetail, FeeIdentifier, Estimate };
    }
    type EstimateRequest = any;
    type FeeDetail = any;
    type FeeIdentifier = any;
    type Estimate = any;
}
declare module "util/sleep" {
    export = sleep;
    function sleep(ms: number): Promise<any>;
}
declare module "helpers/reports" {
    export type ReportRequestInfo = any;
    export type GetReportRequestListResult = any;
    export function getReport(api: any): any;
    export function getReportList(api: any): any;
    export function getReportListAll(api: any): (options?: {}) => Promise<any[]>;
    export function getReportListByNextToken(api: any): any;
    export function getReportRequestList(api: any): any;
    export function getReportScheduleList(api: any): any;
    export function requestAndDownloadReport(api: any): (ReportType: any, file: any, reportParams?: {}) => Promise<any>;
    export function requestReport(api: any): any;
    export function manageReportSchedule(api: any): any;
    export function updateReportAcknowledgements(api: any): any;
}
declare module "index" {
    export = MwsAdvanced;
    class MwsAdvanced {
        constructor(...args: any[]);
        callEndpoint(name: string, apiParams?: any, options?: {
            noFlatten?: boolean;
            returnRaw?: boolean;
            saveRaw?: string;
            saveParsed?: string;
            maxThrottleRetries?: any;
        } | undefined): any;
        init({ region, accessKeyId, secretAccessKey, merchantId, authToken, host, port, }?: {
            accessKeyId?: string;
            secretAccessKey?: string;
            merchantId?: string;
            authToken?: string;
            region?: string;
            host?: string;
            port?: number;
        }): any;
        doRequest(requestData: any, options?: {}): Promise<any>;
        parseEndpoint(outParser: any, inParser?: (x: any) => any): (mwsApiName: any) => (callOptions: any, opt: any) => Promise<any>;
        getInboundGuidanceForASIN(...params: any[]): any;
        getInboundGuidanceForSKU(...params: any[]): any;
        getMarketplaces(...params: any[]): any;
        listOrders(...params: any[]): any[];
        listOrderItems(...params: any[]): any;
        getOrder(...params: any[]): any;
        listFinancialEvents(...params: any[]): any;
        listInventorySupply(...params: any[]): {
            nextToken: string;
            supplyList: any[];
        };
        listMatchingProducts(...params: any[]): any[];
        getMatchingProductForId(...params: any[]): any[];
        getLowestPricedOffersForAsin(...params: any[]): any;
        getLowestPricedOffersForSku(...params: any[]): any;
        getMyFeesEstimate(...params: any[]): Object;
        getProductCategoriesForAsins(...params: any[]): any[];
        getProductCategoriesForSkus(...params: any[]): any[];
        getReport(options: {
            ReportId: string;
        }): any;
        getReportList(...params: any[]): any;
        getReportListAll(...params: any[]): Promise<any[]>;
        getReportListByNextToken(...params: any[]): any;
        getReportRequestList(...params: any[]): any[];
        getReportScheduleList(...params: any[]): any;
        manageReportSchedule(...params: any[]): any;
        requestAndDownloadReport(...params: any[]): Promise<any>;
        requestReport(...params: any[]): any;
        updateReportAcknowledgements(...params: any[]): any;
        mws: any;
    }
    namespace MwsAdvanced {
        export type constants = any;
        export { constants };
    }
    const constants: {
        MWS_MARKETPLACES: {
            CA: string;
            MX: string;
            US: string;
            BR: string;
            DE: string;
            ES: string;
            FR: string;
            IT: string;
            UK: string;
            IN: string;
            CN: string;
            AU: string;
            JP: string;
            TR: string;
        };
        MWS_ENDPOINTS: {
            NA: string;
            BR: string;
            EU: string;
            IN: string;
            CN: string;
            AU: string;
            JP: string;
        };
        MARKET_CURRENCY: {
            US: string;
            CA: string;
        };
    };
}
type marketDetail = any;
type detailedOrderInfo = any;
type money = any;
type pointsGranted = any;
type taxCollection = any;
type invoiceData = any;
type orderItem = any;
type orderItemList = any;
