const endpoints = {
    RequestReport: {
        category: 'Reports',
        version: '2009-01-01',
        action: 'RequestReport',
    },
    GetReportRequestList: {
        category: 'Reports',
        version: '2009-01-01',
        action: 'GetReportRequestList',
    },
    GetReport: {
        category: 'Reports',
        version: '2009-01-01',
        action: 'GetReport',
    },
    GetReportList: {
        category: 'Reports',
        version: '2009-01-01',
        action: 'GetReportList',
    },
    GetReportListByNextToken: {
        category: 'Reports',
        version: '2009-01-01',
        action: 'GetReportListByNextToken',
    }
};

module.exports = {
    endpoints,
};
