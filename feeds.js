const endpoints = {
    SubmitFeed: {
        category: 'Feeds',
        version: '2009-01-01',
        action: 'SubmitFeed',
    },
    GetFeedSubmissionList: {
        category: 'Feeds',
        version: '2009-01-01',
        action: 'GetFeedSubmissionList',
    },
    GetFeedSubmissionListByNextToken: {
        category: 'Feeds',
        version: '2009-01-01',
        action: 'GetFeedSubmissionListByNextToken',
    },
    GetFeedSubmissionCount: {
        category: 'Feeds',
        version: '2009-01-01',
        action: 'GetFeedSubmissionCount',
    },
    CancelFeedSubmissions: {
        category: 'Feeds',
        version: '2009-01-01',
        action: 'CancelFeedSubmissions',
    },
    GetFeedSubmissionResult: {
        category: 'Feeds',
        version: '2009-01-01',
        action: 'GetFeedSubmissionResult',
    },
};

module.exports = {
    endpoints,
};
