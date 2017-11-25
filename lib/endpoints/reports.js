const path = require('path');

const generateEndpoints = require('./endpoints-utils');

const constants = require('./constants.js');

const scriptName = path.basename(__filename, '.js');
const categoryName = `${scriptName.charAt(0).toUpperCase()}${scriptName.slice(1)}`;

const apiVersion = '2009-01-01';

const endpointList = [
    'RequestReport',
    'GetReportRequestList',
    'GetReportRequestListByNextToken',
    'GetReportRequestCount',
    'CancelReportRequests',
    'GetReportList',
    'GetReportListByNextToken',
    'GetReportCount',
    'GetReport',
    'ManageReportSchedule',
    'GetReportScheduleList',
    'GetReportScheduleListByNextToken',
    'GetReportScheduleCount',
    'UpdateReportAcknowledgements',
];

const newEndpointList = {
    RequestReport: {
        throttle: {
            maxInFlight: 15,
            restoreRate: 60,
        },
        params: {
            ReportType: {
                type: 'xs:string',
                required: true,
            },
            StartDate: {
                type: 'xs:dateTime',
                required: false,
            },
            EndDate: {
                type: 'xs:dateTime',
                required: false,
            },
            ReportOptions: {
                type: 'xs:string',
                required: false,
            },
            MarketplaceIdList: {
                type: 'xs:string',
                required: false, // TODO: only available in NA and EU regions
            },
        },
        returns: {
            ReportRequestInfo: {
                type: 'ReportRequestInfo',
                required: true, // TODO: Docs don't specifically state it's required. what if empty?
            },
        },
    },
    GetReportRequestList: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 78, // approximate, you get one back every 45 seconds, so roughly 78 per hour
        },
        params: {
            ReportRequestIdList: {
                type: 'xs:string',
                required: false,
                list: 'ReportRequestIdList.Id',
            },
            ReportTypeList: {
                type: 'xs:string',
                required: false,
                list: 'ReportTypeList.Type',
                values: constants.REQUEST_REPORT_TYPES,
            },
            ReportProcessingStatusList: {
                type: 'xs:string',
                required: false,
                list: 'ReportProcessingStatusList.Status',
                values: constants.REPORT_PROCESSING_STATUS_TYPES,
            },
            MaxCount: {
                type: 'xs:positiveInteger', // Documentation page says 'xs:nonNegativeInteger', but the range starts at 1, which makes it a xs:positiveInteger
                required: false,
                maxValue: 100,
            },
            RequestedFromDate: {
                type: 'xs:dateTime',
                required: false,
            },
            RequestedToDate: {
                type: 'xs:dateTime',
                required: false,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            HasNext: {
                type: 'xs:boolean', // TODO: need to add xs:boolean to the validate function.. does it come in as a string ("True"/"False") or a bool value?
                required: true,
            },
            ReportRequestInfo: {
                type: 'ReportRequestInfo',
                required: true,
            },
        },
    },
    GetReportRequestListByNextToken: {
        throttle: {
            maxInFlight: 30,
            restoreRate: 1800,
        },
        params: {
            NextToken: {
                type: 'xs:string',
                required: true,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            HasNext: {
                type: 'xs:boolean', // TODO: need to add xs:boolean to the validate function.. does it come in as a string ("True"/"False") or a bool value?
                required: true,
            },
            ReportRequestInfo: {
                type: 'ReportRequestInfo',
                required: true,
            },
        },
    },
    GetReportRequestCount: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 78,
        },
        params: {
            ReportTypeList: {
                type: 'xs:string',
                required: false,
                values: constants.REQUEST_REPORT_TYPES,
            },
            ReportProcessingStatusList: {
                type: 'xs:string',
                required: false,
                values: constants.REPORT_PROCESSING_STATUS_TYPES,
            },
            RequestedFromDate: {
                type: 'xs:dateTime',
                required: false,
            },
            RequestedToDate: {
                type: 'xs:dateTime',
                required: false,
            },
        },
        returns: {
            Count: {
                type: 'xs:nonNegativeInteger',
                required: true,
            },
        },
    },
    CancelReportRequests: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 78,
        },
        params: {
            ReportRequestIdList: {
                type: 'xs:string',
                required: false,
                list: 'ReportRequestIdList.Id',
            },
            ReportTypeList: {
                type: 'xs:string',
                required: false,
                values: constants.REQUEST_REPORT_TYPES,
                list: 'ReportTypeList.Type',
            },
            ReportProcessingStatusList: {
                type: 'xs:string',
                required: false,
                values: constants.REPORT_PROCESSING_STATUS_TYPES,
            },
            RequestedFromDate: {
                type: 'xs:dateTime',
                required: false,
            },
            RequestedToDate: {
                type: 'xs:dateTime',
                required: false,
            },
        },
        returns: {
            Count: {
                type: 'xs:nonNegativeInteger',
                required: true,
            },
            ReportRequestInfo: {
                type: 'ReportRequestInfo',
                required: true,
            },
        },
    },
    GetReportList: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 60,
        },
        params: {
            MaxCount: {
                type: 'xs:positiveInteger', // docs say nonNegativeInteger, range 1-100
                required: false,
                maxValue: 100,
            },
            ReportTypeList: {
                type: 'xs:string',
                required: false,
                values: [
                    ...constants.REQUEST_REPORT_TYPES,
                    ...constants.NOREQUEST_REPORT_TYPES,
                    ...constants.SCHEDULED_REPORT_TYPES,
                ],
                list: 'ReportTypeList.Type',
            },
            Acknowledged: {
                type: 'xs:boolean',
                required: false,
            },
            ReportRequestIdList: {
                type: 'xs:string',
                required: false,
                list: 'ReportRequestIdList.Id',
            },
            AvailableFromDate: {
                type: 'xs:dateTime',
                required: false,
            },
            AvailableToDate: {
                type: 'xs:dateTime',
                required: false,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            HasNext: {
                type: 'xs:boolean',
                required: true,
            },
            ReportInfo: {
                type: 'ReportInfo',
                required: true,
            },
        },
    },
    GetReportListByNextToken: {
        throttle: {
            maxInFlight: 30,
            restoreRate: 1800,
        },
        params: {
            NextToken: {
                type: 'xs:string',
                required: true,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            HasNext: {
                type: 'xs:boolean',
                required: true,
            },
            ReportInfo: {
                type: 'ReportInfo',
                required: true,
            },
        },
    },
    GetReportCount: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 78,
        },
        params: {
            ReportTypeList: {
                type: 'xs:string',
                required: false,
                list: 'ReportTypeList.Type',
                values: [
                    ...constants.REQUEST_REPORT_TYPES,
                    ...constants.NOREQUEST_REPORT_TYPES,
                    ...constants.SCHEDULED_REPORT_TYPES,
                ],
            },
            Acknowledged: {
                type: 'xs:boolean',
                required: false,
            },
            AvailableFromDate: {
                type: 'xs:dateTime',
                required: false,
            },
            AvailableToDate: {
                type: 'xs:dateTime',
                required: false,
            },
        },
        returns: {
            Count: { // Return types are not documented on this page! Assuming from example.
                type: 'xs:nonNegativeInteger',
                required: true,
            },
        },
    },
    GetReport: {
        throttle: {
            maxInFlight: 15,
            restoreRate: 60,
        },
        params: {
            ReportId: {
                type: 'xs:string',
                required: true,
            },
        },
        returns: {
            Report: {
                type: 'xs:string',
                required: true,
            },
        },
    },
    ManageReportSchedule: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 78,
        },
        params: {
            ReportType: {
                type: 'xs:string',
                required: true,
                values: constants.SCHEDULED_REPORT_TYPES,
            },
            Schedule: {
                type: 'xs:string',
                required: true,
                values: constants.SCHEDULE_TYPES,
            },
            ScheduleDate: {
                type: 'xs:dateTime',
                required: false,
            },
        },
        returns: {
            Count: {
                type: 'xs:nonNegativeInteger',
                required: true,
            },
            ReportSchedule: {
                type: 'ReportSchedule',
                required: true,
            },
        },
    },
    GetReportScheduleList: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 78,
        },
        params: {
            ReportTypeList: {
                type: 'xs:string',
                required: false,
                values: constants.SCHEDULED_REPORT_TYPES,
            },
        },
        returns: {
            NextToken: {
                type: 'xs:string',
                required: false,
            },
            HasNext: {
                type: 'xs:boolean',
                required: true,
            },
            ReportSchedule: {
                type: 'ReportSchedule',
                required: true,
            },
        },
    },
    GetReportScheduleListByNextToken: { // Doc says: "this operation can never be called ... it is included for future compatibility"
        throttle: {
            maxInFlight: 1,
            restoreRate: 1,
        },
        params: {
            DO_NOT_USE_THIS: {
                type: 'DO NOT USE GETREPORTSCHEDULELISTBYNEXTTOKEN',
                required: true,
            },
        },
        returns: {
            // NextToken: {
            //     type: 'xs:string',
            //     required: false,
            // },
            // HasNext: {
            //     type: 'xs:boolean',
            //     required: true,
            // },
            // ReportSchedule: {
            //     type: 'ReportSchedule',
            //     required: true,
            // }
        },
    },
    GetReportScheduleCount: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 78,
        },
        params: {
            ReportTypeList: {
                type: 'xs:string',
                required: false,
                values: [
                    ...constants.SCHEDULED_REPORT_TYPES,
                    ...constants.REQUEST_REPORT_TYPES,
                ],
                list: 'ReportTypeList.Type',
            },
        },
        returns: {
            Count: {
                type: 'xs:nonNegativeInteger',
                required: true,
            },
        },
    },
    UpdateReportAcknowledgements: {
        throttle: {
            maxInFlight: 10,
            restoreRate: 78,
        },
        params: {
            ReportIdList: {
                type: 'xs:string',
                required: true,
                list: 'ReportIdList.Id',
            },
            Acknowledged: {
                type: 'xs:boolean',
                required: true,
            },
        },
        returns: {
            Count: {
                type: 'xs:nonNegativeInteger',
                required: true,
            },
            ReportInfo: {
                type: 'ReportInfo',
                required: true,
            },
        },
    },
};

const endpoints = generateEndpoints(
    categoryName,
    apiVersion,
    endpointList,
    newEndpointList,
);

module.exports = endpoints;
