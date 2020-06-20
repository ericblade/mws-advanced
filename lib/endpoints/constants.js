/**
 * Constants for endpoint handling code. Mostly report generation functions use these.
 * @module endpoints/constants
 * @private
 */

/**
 * List of all valid request report types.
 * This should probably be a hash map from sane values into values that Amazon understands,
 * but we don't really have reporting done very well yet.
 */
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
    '_GET_FBA_FULFILLMENT_INBOUND_NONCOMPLIANCE_DATA_',
    '_GET_STRANDED_INVENTORY_UI_DATA_',
    '_GET_STRANDED_INVENTORY_LOADER_DATA_',
    '_GET_FBA_INVENTORY_AGED_DATA_',
    '_GET_EXCESS_INVENTORY_DATA_',
    '_GET_FBA_UNO_INVENTORY_DATA_', // Small & Light Inventory report
    '_GET_FBA_RECONCILIATION_REPORT_DATA_', // Inventory Reconciliation
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

/**
 * Report types that can only be accessed via Scheduling. These reports cannot be requested
 * via any report request function.
 * @private
 */
const SCHEDULED_REPORT_TYPES = [
    '_GET_FLAT_FILE_ACTIONABLE_ORDER_DATA_',
    '_GET_ORDERS_DATA_',
    '_GET_FLAT_FILE_ORDERS_DATA_',
    '_GET_CONVERGED_FLAT_FILE_ORDER_REPORT_DATA_',
];

/**
 * reports that can ONLY be retrieved with GetReport - MWS runs them automatically
 * @private
 */
const NOREQUEST_REPORT_TYPES = [
    '_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_',
    '_GET_V2_SETTLEMENT_REPORT_DATA_XML_',
    '_GET_V2_SETTLEMENT_REPORT_DATA_FILE_FILE_V2_',
    'FeedSummaryReport', // Results of a Feed Upload. These may show up as pure text, or as JSON
    // data inside a AmazonEnvelope {} structure
    /*
        Feed Processing Summary:
            Number of records processed             1
            Number of records successful            1
    */
    /* AmazonEnvelope: { MessageType, StatusCode, ProcessingReport: { ProcessingSummary: {
     *   MessagesProcessed,
     *   MessagesSuccessful,
     *   MessagesWithError,
     *   MessagesWithWarning,
     * }}
     */
];

/**
 * status indicators for report processing status updates
 */
const REPORT_PROCESSING_STATUS_TYPES = [
    '_SUBMITTED_',
    '_IN_PROGRESS_',
    '_CANCELLED_',
    '_DONE_',
    '_DONE_NO_DATA_',
];

/**
 * constants for configuring mws report generation scheduling
 * @private
 */
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

module.exports = {
    REQUEST_REPORT_TYPES,
    SCHEDULED_REPORT_TYPES,
    NOREQUEST_REPORT_TYPES,
    REPORT_PROCESSING_STATUS_TYPES,
    SCHEDULE_TYPES,
};
