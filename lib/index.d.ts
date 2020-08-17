import { OrderItem } from "./parsers/orderItems";

type InitParams = {
    accessKeyId: string;
    merchantId: string;
    secretAccessKey: string;
    authToken?: string;
    host?: string;
    port?: number;
    region?: string;
};

// cSpell: disable
type MWS_MARKETPLACES = {
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
type CountryCode = keyof MWS_MARKETPLACES;

type MARKET_CURRENCY = {
    CA: 'CAD',
    US: 'USD',
};

type CurrencyCode = ValueOf<MARKET_CURRENCY>;

type MWS_ENDPOINTS = {
    AU: 'mws.amazonservices.com.au',
    BR: 'mws.amazonservices.com',
    CN: 'mws.amazonservices.com.cn',
    EU: 'mws-eu.amazonservices.com',
    IN: 'mws.amazonservices.in',
    JP: 'mws.amazonservices.jp',
    NA: 'mws.amazonservices.com',
};

type MWSDomain = ValueOf<MWS_ENDPOINTS>;

type ListFinancialResultsParams = {
    MaxResultsPerPage?: number,
    AmazonOrderId?: string,
    FinancialEventGroupId?: string,
    PostedAfter?: Date,
    PostedBefore?: Date,
};

type ListFinancialResultsReturn = {
    NextToken: string,
    FinancialEvents: any,
};

type ShipmentStatus =
    | 'WORKING'
    | 'SHIPPED'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'CHECKED_IN'
    | 'RECEIVING'
    | 'CLOSED'
    | 'CANCELLED'
    | 'DELETED'
    | 'ERROR';

type ListInboundShipmentsParams = {
    ShipmentStatusList?: Array<ShipmentStatus>,
    ShipmentIdList?: Array<string>,
    LastUpdatedAfter?: Date,
    LastUpdatedBefore?: Date,
};

type ListInboundShipmentsReturn = {
    NextToken: string,
    ShipmentData: any,
};

type GetInboundGuidanceForASINParams = {
    MarketplaceId: MarketplaceId,
    ASINList: Array<string>,
};

type GetInboundGuidanceForSKUParams = {
    MarketplaceId: MarketplaceId,
    SellerSKUList: Array<string>,
};

type ListInventorySupplyParams = {
    SellerSkus?: Array<string>,
    QueryStartDateTime?: Date,
    ResponseGroup?: 'Basic' | 'Detailed',
    MarketplaceId?: string,
};

type ListInventorySupplyReturn = {
    supplyList: any,
    NextToken?: string,
};

type MarketplaceEnumeration = {
    marketplaceId: MarketplaceId,
    defaultCountryCode: CountryCode,
    domainName: MWSDomain,
    defaultCurrencyCode: CurrencyCode,
    sellerId: string,
    hasSellerSuspendedListings: 'Yes' | 'No',
};

type GetMarketplacesReturn = {
    [key: string]: MarketplaceEnumeration, // TODO: should use MarketplaceId not string, but that's an error using a union type
};

type OrderStatus =
    | 'PendingAvailability'
    | 'Pending'
    | 'Unshipped'
    | 'PartiallyShipped'
    | 'Shipped'
    | 'InvoiceUnconfirmed'
    | 'Canceled'
    | 'Unfulfillable';

type TFMShipmentStatus =
    | 'PendingPickUp'
    | 'LabelCanceled'
    | 'PickedUp'
    | 'AtDestinationFC'
    | 'Delivered'
    | 'RejectedByBuyer'
    | 'Undeliverable'
    | 'ReturnedToSeller'
    | 'Lost';

type ListOrdersParams = {
    MarketplaceId: Array<MarketplaceId>,
    CreatedAfter?: Date,
    CreatedBefore?: Date,
    LastUpdatedAfter?: Date,
    LastUpdatedBefore?: Date,
    OrderStatus?: Array<OrderStatus>,
    FulfillmentChannel?: Array<string>, // TODO: what are valid values?
    PaymentMethod?: Array<string>, // TODO: what are valid values?
    BuyerEmail?: string,
    SellerOrderId?: string,
    MaxResultsPerPage?: number, // TODO: positive number only?
    TFMShipmentStatus?: TFMShipmentStatus,
};

type Currency = {
    Amount: string,
    CurrencyCode: string,
};

// TODO: #176 the lib should convert all string bools to actual bools in the parsers, then this shouldn't be necessary anymore
type StringBool = 'true' | 'false';

type ShippingAddress = {
    City: string,
    PostalCode: string,
    isAddressSharingConfidential: StringBool;
    StateOrRegion: string,
    CountryCode: string, // union?
};

type OrderListResult = { // TODO: #177 are we not parsing listOrders results out to javascript norms
    LatestShipDate: string, // Date
    OrderType: string, // union
    PurchaseDate: string, // Date
    BuyerEmail: string,
    AmazonOrderId: string,
    LastUpdateDate: string, // Date
    IsReplacementOrder: StringBool;
    NumberOfItemsShipped: string, // number
    ShipServiceLevel: string, // union
    OrderStatus: OrderStatus,
    SalesChannel: string, // union
    IsBusinessOrder: StringBool;
    NumberOfItemsUnshipped: string, // number
    PaymentMethodDetails: {
        PaymentMethodDetail: string, // union
    },
    IsGlobalExpressEnabled: StringBool;
    IsSoldByAB: StringBool;
    IsPremiumOrder: StringBool;
    OrderTotal: Currency,
    EarliestShipDate: string, // Date,
    MarketplaceId: MarketplaceId,
    FulfillmentChannel: string, // union
    PaymentMethod: string, // union
    ShippingAddress: ShippingAddress,
    IsPrime: StringBool;
    SellerOrderId: string,
    ShipmentServiceLevelCategory: string, // union
};

type ListOrdersReturn = Array<OrderListResult>;

type AmazonOrderId = string;

type ListOrderItemsReturn = {
    orderItems: Array<OrderItem>,
    nextToken?: string,
    orderId: AmazonOrderId,
};

type GetOrderParams = {
    AmazonOrderId: Array<AmazonOrderId>,
};

type OrderInfo = {
    LatestShipDate: string, // Date
    OrderType: string, // Union?
    PurchaseDate: string, // Date
    BuyerEmail: string,
    AmazonOrderId: AmazonOrderId,
    LastUpdateDate: string, // Date
    IsReplacementOrder: StringBool;
    NumberOfItemsShipped: string, // number
    ShipServiceLevel: string, // Union?
    OrderStatus: string, // Union?
    SalesChannel: string, // Union?
    IsBusinessOrder: StringBool;
    NumberOfItemsUnshipped: string, // number
    PaymentMethodDetails: PaymentMethodData, // not sure if correct?
    IsGlobalExpressEnabled: StringBool;
    IsSoldByAB: StringBool;
    IsPremiumOrder: StringBool;
    OrderTotal: Currency,
    EarliestShipDate: string, // Date
    MarketplaceId: MarketplaceId,
    FulfillmentChannel: string, // Union?
    PaymentMethod: string, // Union?
    ShippingAddress: ShippingAddress,
    IsPrime: StringBool;
    SellerOrderId: string, // NOT AMAZONORDERID
    ShipmentServiceLevelCategory: string, // Union?
};

type InboundGuidanceError = {
    error: string,
};

type InboundGuidance = InboundGuidanceError | {
    guidance: string,
    reason: string,
    asin?: string,
};

type InboundGuidanceList = {
    [key: string]: InboundGuidance,
};

type ProductInfo = {
    identifiers: any,
    attributeSets: any,
    relationships: any,
    salesRankings: any,
};

type ListMatchingProductsReturn = Array<ProductInfo>;

type GetMatchingProductReturn = Array<{
    results: Array<ProductInfo>,
    id: string,
    idType: AdvIdTypes,
    asin?: string,
    gcid?: string,
    sellersku?: string,
    upc?: string,
    ean?: string,
    isbn?: string,
    jan?: string,
    Error?: Error,
}>;

type MWSItemCondition =
    | 'New'
    | 'Used'
    | 'Collectible'
    | 'Refurbished'
    | 'Club';

type AdvItemCondition =
    | 'used'
    | 'new'
    | 'collectible'
    | 'refurbished'
    | 'club';

type GetLowestPricedOffersForAsinParams = {
    MarketplaceId: MarketplaceId,
    ASIN: string,
    ItemCondition: MWSItemCondition;
};

type GetLowestPricedOffersForSkuParams = {
    MarketplaceId: MarketplaceId,
    SellerSKU: string,
    ItemCondition: MWSItemCondition;
};

type FulfillmentChannel = 'Amazon' | 'Merchant';

type GetLowestPricedOffersReturn = {
    marketplace: MarketplaceId,
    itemCondition: MWSItemCondition;
    summary: {
        totalOfferCount: number,
        numberOfOffers: Array<{ count: number, condition: AdvItemCondition, fulfillmentChannel: FulfillmentChannel }>,
        listPrice: Currency,
        lowestPrices: Array<{
            condition: AdvItemCondition,
            fulfillmentChannel: FulfillmentChannel,
            landedPrice: Currency,
            listingPrice: Currency,
            shipping: Currency,
        }>,
        buyBoxPrices: Array<{
            condition: AdvItemCondition,
            landedPrice: Currency,
            listingPrice: Currency,
            shipping: Currency,
        }>,
        buyBoxEligibleOffers: Array<{
            count: number,
            condition: AdvItemCondition,
            fulfillmentChannel: FulfillmentChannel,
        }>
    },
    lowestOffers: Array<{
        subCondition: string, // TODO: i'm only seeing 'new' but i think it's enumerated elsewhere
        sellerFeedbackRating: any, // TODO: SellerFeedbackRating,
        shippingTime: {
            minimumHours: string, // number
            maximumHours: string, // number
            availabilityType: string, // NOW, Date? unsure
        },
        listingPrice: Currency,
        shipping: Currency,
        shipsFrom: {
            Country: string,
        },
        isFulfilledByAmazon: boolean,
        isBuyBoxWinner: boolean,
        isFeaturedMerchant: boolean,
    }>,
    asin?: string,
    sellerSku?: string,
};

type ProductCategory = {
    ProductCategoryId: string,
    ProductCategoryName: string,
    Parent?: ProductCategory,
};

type GetProductCategoriesReturn = Array<{
    Self: ProductCategory,
    asin?: string,
    sellerSku?: string,
}>;

type GetFeesParams = {
    marketplaceId: MarketplaceId,
    idType: IdTypes;
    idValue: string,
    isAmazonFulfilled: boolean,
    identifier: string,
    listingPrice: { // TODO: make a AdvCurrency ? rename Amazon's Currency to "Money" as they use it, and name ours Currency?
        currencyCode: string,
        amount: string,
    },
    shipping: {
        currencyCode: string,
        amount: string,
    },
};

type GetFeesReturn = {
    [key: string]: {
        identifier: {
            marketplaceId: MarketplaceId,
            idType: IdTypes;
            sellerId: string,
            sellerInputIdentifier: string,
            isAmazonFulfilled: boolean,
            idValue: string,
            priceToEstimateFees: {
                listingPrice: {
                    amount: string,
                    currencyCode: string,
                },
                shipping: {
                    amount: string,
                    currencyCode: string,
                },
            },
        },
        status: 'ClientError' | 'ServerError' | string, // TODO: not sure what a value here is with no error
        // totalFees only if no error
        totalFees?: {
            amount: string,
            currencyCode: string,
        },
        // time only if no error
        time?: string,
        // detail only if no error, need to fill this in
        detail?: Array<any>,
        error?: {
            code: string,
            message: string,
            type: 'Sender' | 'Receiver',
        },
    },
};

type NextTokenParams = { NextToken: string };

type RequestReportParams = {
    ReportType: string,
    ReportProcessingStatus?: string,
    EndDate?: string,
    Scheduled?: boolean,
    ReportRequestId?: string,
    SubmittedDate?: string,
    StartDate?: string,
};
type RequestReportReturn = any;

type GetReportRequestListParams = {
    ReportRequestIdList?: Array<string>,
    ReportTypeList?: string,
    ReportProcessingStatusList?: string,
    MaxCount?: number,
    RequestedFromDate?: Date,
    RequestedToDate?: Date,
};
type GetReportRequestListReturn = {
    reportRequestList: Array<{
        ReportType: string,
        ReportProcessingStatus: string,
        EndDate: string,
        Scheduled: boolean,
        ReportRequestId: string,
        StartedProcessingDate: string,
        StartDate: string,
        CompletedDate: string,
        GeneratedReportId: string,
    }>,
    nextToken?: string,
};

type GetReportParams = { ReportId: string };
type GetReportReturn = any;

type GetReportListParams = {
    MaxCount?: number,
    ReportTypeList?: Array<string>,
    Acknowledged?: boolean,
    ReportRequestIdList?: Array<string>,
    AvailableFromDate?: Date,
    AvailableToDate?: Date,
};
type GetReportListReturn = any; // TODO ?

type RequestAndDownloadReportReturn = any; // TODO ?

type ManageReportScheduleParams = {
    ReportType: string,
    Schedule: any,
    ScheduleDate?: Date,
};
type ManageReportScheduleReturn = any; // TODO ?

type UpdateReportAcknowledgementsParams = {
    ReportIdList: Array<string>,
    Acknowledged?: boolean,
};
type UpdateReportAcknowledgementsReturn = any; // TODO ?

type GetReportScheduleListParams = { ReportTypeList?: Array<string> };
type GetReportScheduleListReturn = any; // TODO ?

type IdTypes =
    | 'ASIN'
    | 'GCID'
    | 'SellerSKU'
    | 'UPC'
    | 'EAN'
    | 'ISBN'
    | 'JAN';

type AdvIdTypes =
    | 'asin'
    | 'gcid'
    | 'sellersku'
    | 'upc'
    | 'ean'
    | 'isbn'
    | 'jan';

declare class MwsAdvanced {
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
    static parseEndpoint(outParser: () => any, inParser: (x: any) => any): any;
    parseEndpoint(outParser: () => any, inParser: (x: any) => any): any;
    static callEndpoint(name: any, apiParams: any, options: any): any;
    callEndpoint(name: any, apiParams: any, options: any): any;

    getInboundGuidanceForASIN(params: GetInboundGuidanceForASINParams): Promise<InboundGuidanceList>;
    static getInboundGuidanceForASIN(params: GetInboundGuidanceForASINParams): Promise<InboundGuidanceList>;
    getInboundGuidanceForSKU(params: GetInboundGuidanceForSKUParams): Promise<InboundGuidanceList>;
    static getInboundGuidanceForSKU(params: GetInboundGuidanceForSKUParams): Promise<InboundGuidanceList>;
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
    listMatchingProducts(params: { marketplaceId: string, query: string }): Promise<ListMatchingProductsReturn>;
    static listMatchingProducts(params: { marketplaceId: string, query: string }): Promise<ListMatchingProductsReturn>;
    getMatchingProductForId(params: { MarketplaceId: string, IdType: IdTypes, IdList: Array<string> }): Promise<GetMatchingProductReturn>;
    static getMatchingProductForId(params: { MarketplaceId: string, IdType: IdTypes, IdList: Array<string> }): Promise<GetMatchingProductReturn>;

    // TODO: #178 We need to unify whether we use ASIN or Asin (all caps or not) in function names
    getLowestPricedOffersForAsin(params: GetLowestPricedOffersForAsinParams): Promise<GetLowestPricedOffersReturn>;
    static getLowestPricedOffersForAsin(params: GetLowestPricedOffersForAsinParams): Promise<GetLowestPricedOffersReturn>;
    getLowestPricedOffersForSku(params: GetLowestPricedOffersForSkuParams): Promise<GetLowestPricedOffersReturn>;
    static getLowestPricedOffersForSku(params: GetLowestPricedOffersForSkuParams): Promise<GetLowestPricedOffersReturn>;
    getProductCategoriesForAsins(params: { marketplaceId: MarketplaceId, asins: Array<string> }): Promise<GetProductCategoriesReturn>;
    static getProductCategoriesForAsins(params: { marketplaceId: MarketplaceId, asins: Array<string> }): Promise<GetProductCategoriesReturn>;
    getProductCategoriesForSkus(params: { marketplaceId: MarketplaceId, sellerSkus: Array<string> }): Promise<GetProductCategoriesReturn>;
    static getProductCategoriesForSkus(params: { marketplaceId: MarketplaceId, sellerSkus: Array<string> }): Promise<GetProductCategoriesReturn>;
    getMyFeesEstimate(params: Array<GetFeesParams>): Promise<GetFeesReturn>;
    static getMyFeesEstimate(params: Array<GetFeesParams>): Promise<GetFeesReturn>;

    requestReport(params: RequestReportParams): Promise<RequestReportReturn>;
    static requestReport(params: RequestReportParams): Promise<RequestReportReturn>;

    getReportRequestList(params: GetReportRequestListParams): Promise<GetReportRequestListReturn>;
    static getReportRequestList(params: GetReportRequestListParams): Promise<GetReportRequestListReturn>;

    getReport(params: GetReportParams): Promise<GetReportReturn>;
    static getReport(params: GetReportParams): Promise<GetReportReturn>;

    getReportList(params: GetReportListParams): Promise<GetReportListReturn>;
    static getReportList(params: GetReportListParams): Promise<GetReportListReturn>;
    getReportListByNextToken(params: NextTokenParams): Promise<GetReportListReturn>;
    static getReportListByNextToken(params: NextTokenParams): Promise<GetReportListReturn>;
    getReportListAll(params: GetReportListParams): Promise<GetReportListReturn>;
    static getReportListAll(params: GetReportListParams): Promise<GetReportListReturn>;

    requestAndDownloadReport(reportType: string, file: string, params?: any): Promise<RequestAndDownloadReportReturn>;
    static requestAndDownloadReport(reportType: string, file: string, params?: any): Promise<RequestAndDownloadReportReturn>;

    manageReportSchedule(params: ManageReportScheduleParams): Promise<ManageReportScheduleReturn>;
    static manageReportSchedule(params: ManageReportScheduleParams): Promise<ManageReportScheduleReturn>;

    updateReportAcknowledgements(params: UpdateReportAcknowledgementsParams): Promise<UpdateReportAcknowledgementsReturn>;
    static updateReportAcknowledgements(params: UpdateReportAcknowledgementsParams): Promise<UpdateReportAcknowledgementsReturn>;

    getReportScheduleList(params: GetReportScheduleListParams): Promise<GetReportScheduleListReturn>;
    static getReportScheduleList(params: GetReportScheduleListParams): Promise<GetReportScheduleListReturn>;
}

export = MwsAdvanced;
