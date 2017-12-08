const REQUEST_REPORT_TYPES = [
    // Inventory Reports -- see http://docs.developer.amazonservices.com/en_US/reports/Reports_ReportType.html
    '_GET_FLAT_FILE_OPEN_LISTINGS_DATA_',
    '_GET_MERCHANT_LISTINGS_ALL_DATA_',
    '_GET_MERCHANT_LISTINGS_DATA_',
    '_GET_MERCHANT_LISTINGS_INACTIVE_DATA_',
    '_GET_MERCHANT_LISTINGS_DATA_BACK_COMPAT_',
    '_GET_MERCHANT_LISTINGS_DATA_LITE_',
    '_GET_MERCHANT_LISTINGS_DATA_LITER_',
    '_GET_MERCHANT_CANCELLED_LISTINGS_DATA_',
    '_GET_CONVERGED_FLAT_FILE_SOLD_LISTINGS_DATA_',
    '_GET_MERCHANT_LISTINGS_DEFECT_DATA_',
    '_GET_PAN_EU_OFFER_STATUS_',
    '_GET_MFN_PAN_EU_OFFER_STATUS_',
    // Order Reports
    '_GET_FLAT_FILE_ACTIONABLE_ORDER_DATA_',
    '_GET_CONVERGED_FLAT_FILE_ORDER_REPORT_DATA_',
    // Order Tracking Reports
    '_GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_',
    '_GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_',
    '_GET_XML_ALL_ORDERS_DATA_BY_LAST_UPDATE_',
    '_GET_XML_ALL_ORDERS_DATA_BY_ORDER_DATE_',
    // Pending Order Reports
    '_GET_FLAT_FILE_PENDING_ORDERS_DATA_',
    '_GET_PENDING_ORDERS_DATA_',
    '_GET_CONVERGED_FLAT_FILE_PENDING_ORDERS_DATA_',
    // Performance Reports
    '_GET_SELLER_FEEDBACK_DATA_',
    '_GET_V1_SELLER_PERFORMANCE_REPORT_',
    '_GET_AMAZON_FULFILLED_SHIPMENTS_DATA_',
    // FBA Reports - Sales
    '_GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_',
    '_GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_',
    '_GET_XML_ALL_ORDERS_DATA_BY_LAST_UPDATE_',
    '_GET_XML_ALL_ORDERS_DATA_BY_ORDER_DATE_',
    '_GET_FBA_FULFILLMENT_CUSTOMER_SHIPMENT_SALES_DATA_',
    '_GET_FBA_FULFILLMENT_CUSTOMER_SHIPMENT_PROMOTION_DATA_',
    '_GET_FBA_FULFILLMENT_CUSTOMER_TAXES_DATA_',
    // FBA Reports - Inventory
    '_GET_AFN_INVENTORY_DATA_',
    '_GET_AFN_INVENTORY_DATA_BY_COUNTRY_',
    '_GET_FBA_FULFILLMENT_CURRENT_INVENTORY_DATA_',
    '_GET_FBA_FULFILLMENT_MONTHLY_INVENTORY_DATA_',
    '_GET_FBA_FULFILLMENT_INVENTORY_RECEIPTS_DATA_',
    '_GET_RESERVED_INVENTORY_DATA_',
    '_GET_FBA_FULFILLMENT_INVENTORY_SUMMARY_DATA_',
    '_GET_FBA_FULFILLMENT_INVENTORY_ADJUSTMENTS_DATA_',
    '_GET_FBA_FULFILLMENT_INVENTORY_HEALTH_DATA_',
    '_GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_',
    '_GET_FBA_MYI_ALL_INVENTORY_DATA_',
    '_GET_FBA_FULFILLMENT_CROSS_BORDER_INVENTORY_MOVEMENT_DATA_',
    '_GET_RESTOCK_INVENTORY_RECOMMENDATIONS_REPORT_',
    '_GET_FBA_FULFILLMENT_INBOUND_NONCOMPILANCE_DATA_',
    '_GET_STRANDED_INVENTORY_UI_DATA_',
    '_GET_STRANDED_INVENTORY_LOADER_DATA_',
    '_GET_FBA_INVENTORY_AGED_DATA_',
    '_GET_EXCESS_INVENTORY_DATA_',
    // FBA Payments Reports
    '_GET_FBA_ESTIMATED_FBA_FEES_TXT_DATA_',
    '_GET_FBA_REIMBURSEMENTS_DATA_',
    // FBA Customer Concessions Reports
    '_GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA_',
    '_GET_FBA_FULFILLMENT_CUSTOMER_SHIPMENT_REPLACEMENT_DATA_',
    // FBA Removals Reports
    '_GET_FBA_RECOMMENDED_REMOVAL_DATA_',
    '_GET_FBA_FULFILLMENT_REMOVAL_ORDER_DETAIL_DATA_',
    '_GET_FBA_FULFILLMENT_REMOVAL_SHIPMENT_DETAIL_DATA_',
    // Tax Reports
    '_GET_FLAT_FILE_SALES_TAX_DATA_',
    '_SC_VAT_TAX_REPORT_',
    // Browse Tree Reports
    '_GET_XML_BROWSE_TREE_DATA_',
];

// reports that can ONLY be scheduled
const SCHEDULED_REPORT_TYPES = [
    '_GET_ORDERS_DATA_',
];

// reports that can ONLY be retrieved with GetReport - MWS runs them automatically
const NOREQUEST_REPORT_TYPES = [
    '_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_',
    '_GET_V2_SETTLEMENT_REPORT_DATA_XML_',
    '_GET_V2_SETTLEMENT_REPORT_DATA_FILE_FILE_V2_',
    'FeedSummaryReport', // what is this? it shows up in GetReportList, but I can't seem to request it
];

const REPORT_PROCESSING_STATUS_TYPES = [
    '_SUBMITTED_',
    '_IN_PROGRESS_',
    '_CANCELLED_',
    '_DONE_',
    '_DONE_NO_DATA_',
];

const SCHEDULE_TYPES = [
    '_15_MINUTES_',
    '_30_MINUTES_',
    '_1_HOUR_',
    '_2_HOURS_',
    '_4_HOURS_',
    '_8_HOURS_',
    '_12_HOURS_',
    '_1_DAY_',
    '_2_DAYS_',
    '_72_HOURS_',
    '_1_WEEK_',
    '_14_DAYS_',
    '_15_DAYS_',
    '_30_DAYS_',
    '_NEVER_',
];

// The documentation on these is a little weird -- In the top part, it describes AU and JP as being
// separate regions, but in the bottom part, it describes them as being poart of the "FE" region,
// despite them having differing endpoint addresses.  It's weird, compared to the others. I don't
// see any other references to the "FE" region anywhere, but I may be blind.
// To reduce complexity, I have just made each endpoint have a different region name, so I follow
// the conventions at the top part of the docs at https://docs.developer.amazonservices.com/en_US/dev_guide/DG_Endpoints.html

const MWS_MARKETPLACES = {
    CA: 'A2EUQ1WTGCTBG2',
    MX: 'A1AM78C64UM0Y8',
    US: 'ATVPDKIKX0DER',
    BR: 'A2Q3Y263D00KWC',
    DE: 'A1PA6795UKMFR9',
    ES: 'A1RKKUPIHCS9HS',
    FR: 'A13V1IB3VIYZZH',
    IT: 'APJ6JRA9NG5V4',
    UK: 'A1F83G8C2ARO7P',
    IN: 'A21TJRUUN4KGV',
    CN: 'AAHKV2X7AFYLW',
    AU: 'A39IBJ37TRP1C6',
};

const MWS_ENDPOINTS = {
    NA: 'mws.amazonservices.com',
    BR: 'mws.amazonservices.com',
    EU: 'mws-eu.amazonservices.com',
    IN: 'mws.amazonservices.in',
    CN: 'mws.amazonservices.com.cn',
    AU: 'mws.amazonservices.com.au',
    JP: 'mws.amazonservices.jp',
};


module.exports = {
    REQUEST_REPORT_TYPES,
    SCHEDULED_REPORT_TYPES,
    NOREQUEST_REPORT_TYPES,
    REPORT_PROCESSING_STATUS_TYPES,
    SCHEDULE_TYPES,
    MWS_MARKETPLACES,
    MWS_ENDPOINTS,
};
