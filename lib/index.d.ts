import { OrderItem } from "./parsers/orderItems";

export type InitParams = {
    accessKeyId: string;
    authToken?: string;
    host?: string;
    merchantId: string;
    port?: number;
    region?: string;
    secretAccessKey: string;
};

// cSpell: disable
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
// cSpell: enable

type ValueOf<T> = T[keyof T];
type MarketplaceId = ValueOf<MWS_MARKETPLACES>;

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

export type ListFinancialResultsParams = {
    MaxResultsPerPage?: number,
    AmazonOrderId?: string,
    FinancialEventGroupId?: string,
    PostedAfter?: Date,
    PostedBefore?: Date,
};

export type ListFinancialResultsReturn = {
    NextToken: string,
    FinancialEvents: any,
};

export type ShipmentStatus =
    'WORKING' |
    'SHIPPED' |
    'IN_TRANSIT' |
    'DELIVERED' |
    'CHECKED_IN' |
    'RECEIVING' |
    'CLOSED' |
    'CANCELLED' |
    'DELETED' |
    'ERROR';

export type ListInboundShipmentsParams = {
    ShipmentStatusList?: Array<ShipmentStatus>,
    ShipmentIdList?: Array<string>,
    LastUpdatedAfter?: Date,
    LastUpdatedBefore?: Date,
};

export type ListInboundShipmentsReturn = {
    NextToken: string,
    ShipmentData: any,
};

export type GetInboundGuidanceForASINParams = {
    MarketplaceId: MarketplaceId,
    ASINList: Array<string>,
};

export type GetInboundGuidanceForSKUParams = {
    MarketplaceId: MarketplaceId,
    SellerSKUList: Array<string>,
};

export type ListInventorySupplyParams = {
    SellerSkus?: Array<string>,
    QueryStartDateTime?: Date,
    ResponseGroup?: 'Basic' | 'Detailed',
    MarketplaceId?: string,
};

export type ListInventorySupplyReturn = {
    NextToken?: string,
    supplyList: any,
};

export type MarketplaceEnumeration = {
    marketplaceId: MarketplaceId,
    defaultCountryCode: string, // TODO: we should be able to make a type for country codes?
    domainName: string, // TODO: we should be able to make a type for domain name
    defaultCurrencyCode: string, // TODO: we should be able to make a type for currencycodes
    sellerId: string,
    hasSellerSuspendedListings: 'Yes' | 'No',
};

export type GetMarketplacesReturn = {
    [key: string]: MarketplaceEnumeration, // TODO: should use MarketplaceId not string, but that's an error using a union type
};

export type OrderStatus =
    'PendingAvailability' |
    'Pending' |
    'Unshipped' |
    'PartiallyShipped' |
    'Shipped' |
    'InvoiceUnconfirmed' |
    'Canceled' |
    'Unfulfillable';

export type TFMShipmentStatus =
    'PendingPickUp' |
    'LabelCanceled' |
    'PickedUp' |
    'AtDestinationFC' |
    'Delivered' |
    'RejectedByBuyer' |
    'Undeliverable' |
    'ReturnedToSeller' |
    'Lost';

export type ListOrdersParams = {
    CreatedAfter?: Date,
    CreatedBefore?: Date,
    LastUpdatedAfter?: Date,
    LastUpdatedBefore?: Date,
    OrderStatus?: Array<OrderStatus>,
    MarketplaceId: Array<MarketplaceId>,
    FulfillmentChannel?: Array<string>, // TODO: what are valid values?
    PaymentMethod?: Array<string>, // TODO: what are valid values?
    BuyerEmail?: string,
    SellerOrderId?: string,
    MaxResultsPerPage?: number, // TODO: positive number only?
    TFMShipmentStatus?: TFMShipmentStatus,
};

export type Currency = {
    Amount: string,
    CurrencyCode: string,
};

export type ShippingAddress = {
    City: string,
    PostalCode: string,
    isAddressSharingConfidential: 'true' | 'false', // Boolean
    StateOrRegion: string,
    CountryCode: string, // union?
};

export type OrderListResult = { // TODO: are we not parsing listOrders results out to javascript norms
    LatestShipDate: string, // Date
    OrderType: string, // union
    PurchaseDate: string, // Date
    BuyerEmail: string,
    AmazonOrderId: string,
    LastUpdateDate: string, // Date
    IsReplacementOrder: 'true' | 'false', // boolean
    NumberOfItemsShipped: string, // number
    ShipServiceLevel: string, // union
    OrderStatus: OrderStatus,
    SalesChannel: string, // union
    IsBusinessOrder: 'true' | 'false', // boolean
    NumberOfItemsUnshipped: string, // number
    PaymentMethodDetails: {
        PaymentMethodDetail: string, // union
    },
    IsGlobalExpressEnabled: 'true' | 'false', // boolean
    IsSoldByAB: 'true' | 'false', // boolean
    IsPremiumOrder: 'true' | 'false', // boolean
    OrderTotal: Currency,
    EarliestShipDate: string, // Date,
    MarketplaceId: MarketplaceId,
    FulfillmentChannel: string, // union
    PaymentMethod: string, // union
    ShippingAddress: ShippingAddress,
    IsPrime: 'true' | 'false', // boolean
    SellerOrderId: string,
    ShipmentServiceLevelCategory: string, // union
};

export type ListOrdersReturn = Array<OrderListResult>;

export type AmazonOrderId = string;

export type ListOrderItemsReturn = {
    orderItems: Array<OrderItem>,
    nextToken?: string,
    orderId: AmazonOrderId,
};

export type GetOrderParams = {
    AmazonOrderId: Array<AmazonOrderId>,
};

export type OrderInfo = {
    LatestShipDate: string, // Date
    OrderType: string, // Union?
    PurchaseDate: string, // Date
    BuyerEmail: string,
    AmazonOrderId: AmazonOrderId,
    LastUpdateDate: string, // Date
    IsReplacementOrder: 'true' | 'false', // bool
    NumberOfItemsShipped: string, // number
    ShipServiceLevel: string, // Union?
    OrderStatus: string, // Union?
    SalesChannel: string, // Union?
    IsBusinessOrder: 'true' | 'false', // bool
    NumberOfItemsUnshipped: string, // number
    PaymentMethodDetails: PaymentMethodData, // not sure if correct?
    IsGlobalExpressEnabled: 'true' | 'false', // bool
    IsSoldByAB: 'true' | 'false', // bool
    IsPremiumOrder: 'true' | 'false', // bool
    OrderTotal: Currency,
    EarliestShipDate: string, // Date
    MarketplaceId: MarketplaceId,
    FulfillmentChannel: string, // Union?
    PaymentMethod: string, // Union?
    ShippingAddress: ShippingAddress,
    IsPrime: 'true' | 'false', // bool
    SellerOrderId: string, // NOT AMAZONORDERID
    ShipmentServiceLevelCategory: string, // Union?
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

    getInboundGuidanceForASIN(params: GetInboundGuidanceForASINParams);
    static getInboundGuidanceForASIN(params: GetInboundGuidanceForASINParams);
    getInboundGuidanceForSKU(params: GetInboundGuidanceForSKUParams);
    static getInboundGuidanceForSKU(params: GetInboundGuidanceForSKUParams);
    getMarketplaces(): Promise<GetMarketplacesReturn>;
    static getMarketplaces(): Promise<GetMarketplacesReturn>;
    listOrders(params: ListOrdersParams): Promise<ListOrdersReturn>;
    static listOrders(params: ListOrdersParams): Promise<ListOrdersReturn>;
    listOrderItems(params: AmazonOrderId): Promise<ListOrderItemsReturn>;
    static listOrderItems(params: AmazonOrderId): Promise<ListOrderItemsReturn>;
    getOrder(params: GetOrderParams): Promise<Array<OrderInfo>>;
    static getOrder(params: GetOrderParams): Promise<Array<OrderInfo>>;
    listFinancialEvents(params: ListFinancialResultsParams): Promise<ListFinancialResultsReturn>;
    static listFinancialEvents(params: ListFinancialResultsParams): Promise<ListFinancialResultsReturn>;
    listInventorySupply(params: ListInventorySupplyParams): Promise<ListInventorySupplyReturn>;
    static listInventorySupply(params: ListInventorySupplyParams): Promise<ListInventorySupplyReturn>;
    listMatchingProducts(params: any);
    static listMatchingProducts(params: any);
    getMatchingProductForId(params: any);
    static getMatchingProductForId(params: any);

    // TODO: We need to unify whether we use ASIN or Asin (all caps or not) in function names
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
    requestAndDownloadReport(reportType: string, file: string, params?: any);
    static requestAndDownloadReport(reportType: string, file: string, params?: any);
    manageReportSchedule(params: any);
    static manageReportSchedule(params: any);
    updateReportAcknowledgements(params: any);
    static updateReportAcknowledgements(params: any);
    getReportScheduleList(params: any);
    static getReportScheduleList(params: any);
}
