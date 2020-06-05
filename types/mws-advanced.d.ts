declare module "@ericblade/mws-advanced" {
    export type InitParams = {
        accessKeyId: string;
        authToken?: string;
        host?: string;
        merchantId: string;
        port?: number;
        region?: string;
        secretAccessKey: string;
    };

    export type MWS_MARKETPLACES = {
        AU: 'A39IBJ37TRP1C6',
        BR: 'A2Q3Y263D00KWC',
        CA: 'A2EUQ1WTGCTBG2',
        CN: 'AAHKV2X7AFYLW',
        DE: 'A1PA6795UKMFR9',
        ES: 'A1RKKUPIHCS9HS',
        FR: 'A13V1IB3VIYZZH',
        IN: 'A21TJRUUN4KGV',
        IT: 'APJ6JRA9NG5V4',
        JP: 'A1VC38T7YXB528',
        MX: 'A1AM78C64UM0Y8',
        TR: 'A33AVAJ2PDY3EV',
        UK: 'A1F83G8C2ARO7P',
        US: 'ATVPDKIKX0DER',
    };

    export type MARKET_CURRENCY = {
        CA: 'CAD',
        US: 'USD',
    };

    export type MWS_ENDPOINTS = {
        AU: 'mws.amazonservices.com.au',
        BR: 'mws.amazonservices.com',
        CN: 'mws.amazonservices.com.cn',
        EU: 'mws-eu.amazonservices.com',
        IN: 'mws.amazonservices.in',
        JP: 'mws.amazonservices.jp',
        NA: 'mws.amazonservices.com',
    };

    export default class MwsAdvanced {
        static constants: {
            MWS_MARKETPLACES: MWS_MARKETPLACES,
            MARKET_CURRENCY: MARKET_CURRENCY,
            MWS_ENDPOINTS: MWS_ENDPOINTS,
        };

        constants: {
            MWS_MARKETPLACES: MWS_MARKETPLACES,
            MARKET_CURRENCY: MARKET_CURRENCY,
            MWS_ENDPOINTS: MWS_ENDPOINTS,
        };

        constructor(params: InitParams);
        static init(params: InitParams): MwsAdvanced;
        init(params: InitParams): MwsAdvanced;
        doRequest(requestData: any, options: any): any;
        static parseEndpoint(outParser: () => any, inParser: (x: any) => any);
        parseEndpoint(outParser: () => any, inParser: (x: any) => any);
        static callEndpoint(name: any, apiParams: any, options: any);
        callEndpoint(name: any, apiParams: any, options: any);

        getInboundGuidanceForASIN(params: any);
        static getInboundGuidanceForASIN(params: any);
        getInboundGuidanceForSKU(params: any);
        static getInboundGuidanceForSKU(params: any);
        getMarketplaces(params: any);
        static getMarketplaces(params: any);
        listOrders(params: any);
        static listOrders(params: any);
        listOrderItems(params: any);
        static listOrderItems(params: any);
        getOrder(params: any);
        static getOrder(params: any);
        listFinancialEvents(params: any);
        static listFinancialEvents(params: any);
        listInventorySupply(params: any);
        static listInventorySupply(params: any);
        listMatchingProducts(params: any);
        static listMatchProducts(params: any);
        getMatchingProductForId(params: any);
        static getMatchingProductForId(params: any);

        // TODO: We need to unify wheter we use ASIN or Asin (all caps or not) in function names
        getLowestPricedOffersForAsin(params: any);
        static getLowestPricedOffersForAsin(params: any);
        getLowestPricedOffersForSku(params: any);
        static getLowestPricedOffersForSku(params: any);
        getProductCategoriesForAsins(params: any);
        static getProductCategoriesForAsins(params: any);
        getProductCategoriesForSkus(params: any);
        static getProductCategoriesForSkus(params: any);
        getMyFeesEstimate(params: any);
        static getMyFeesEstimate(params: any);
        requestReport(params: any);
        static requestReport(params: any);
        getReportRequestList(params: any);
        static getReportRequestList(params: any);
        getReport(options: any);
        static getReport(params: any);
        getReportList(params: any);
        static getReportList(params: any);
        getReportListByNextToken(params: any);
        static getReportListByNextToken(params: any);
        getReportListAll(params: any);
        static getReportListAll(params: any);
        requestAndDownloadReport(params: any);
        static requestAndDownloadReport(params: any);
        manageReportSchedule(params: any);
        static manageReportSchedule(params: any);
        updateReportAcknowledgements(params: any);
        static updateReportAcknowledgements(params: any);
        getReportScheduleList(params: any);
        static getReportScheduleList(params: any);
    }
}