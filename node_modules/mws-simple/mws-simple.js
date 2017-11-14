/*
 * mws-simple.js: nodejs Amazon MWS API in 100 lines of code
 */
'use strict';
let crypto = require('crypto');
let request = require('request');
let xmlParser = require('xml2js').parseString;
let tabParser = require('csv-parse');
let qs = require('query-string');

// Client is the class constructor
module.exports = Client;

// Used for User-Agent header
let appId = 'mws-simple';
let appVersionId = '1.0.0';

function Client(opts) {
  // force 'new' constructor
  if (!(this instanceof Client)) return new Client(opts);

  this.host = opts.host || 'mws.amazonservices.com';
  this.port = opts.port || 443

  if (opts.accessKeyId) this.accessKeyId = opts.accessKeyId;
  if (opts.secretAccessKey) this.secretAccessKey = opts.secretAccessKey;
  if (opts.merchantId) this.merchantId = opts.merchantId;
}

//
// http://docs.developer.amazonservices.com/en_US/dev_guide/DG_ClientLibraries.html
//
Client.prototype.request = function(requestData, callback) {
  // Try to allow all assumptions to be overriden by caller if needed
  if (!requestData.path) {
    requestData.path = '/';
  }
  if (!requestData.query.Timestamp) {
    requestData.query.Timestamp = (new Date()).toISOString();
  }
  if (!requestData.query.AWSAccessKeyId) {
    requestData.query.AWSAccessKeyId = this.accessKeyId;
  }
  if (!requestData.query.SellerId) {
    requestData.query.SellerId = this.merchantId;
  }
  if (!requestData.responseFormat) {
    requestData.responseFormat = 'xml';
  }

  // Create the Canonicalized Query String
  requestData.query.SignatureMethod = 'HmacSHA256';
  requestData.query.SignatureVersion = '2';
  // qs.stringify will sorts the keys and url encode
  let stringToSign = ["POST", this.host, requestData.path, qs.stringify(requestData.query)].join('\n');
  requestData.query.Signature = crypto.createHmac('sha256', this.secretAccessKey).update(stringToSign).digest('base64');

  let options = {
    url: 'https://' + this.host + ':' + this.port + requestData.path,
    headers: {
      Host: this.host,
    },
    qs: requestData.query
  }

  // Use specified User-Agent or assume one
  if (requestData.headers && requestData.headers['User-Agent']) {
    options.headers['User-Agent'] = requestData.headers['User-Agent'];
  } else {
    // http://docs.developer.amazonservices.com/en_US/dev_guide/DG_ClientLibraries.html (Creating the User-Agent header)
    options.headers['User-Agent'] = appId + '/' + appVersionId + ' (Language=JavaScript)';
  }

  // Use specified Content-Type or assume one
  if (requestData.headers && requestData.headers['Content-Type']) {
    options.headers['Content-Type'] = requestData.headers['Content-Type'];
  } else if (requestData.feedContent) {
    if (requestData.feedContent.slice(0, 5) === '<?xml') {
      options.headers['Content-Type'] = 'text/xml';
    } else {
      options.headers['Content-Type'] = 'text/tab-separated-values; charset=iso-8859-1';
    }
  } else {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
  }

  // Add body content if any
  if (requestData.feedContent) {
    options.body = requestData.feedContent;
    options.headers['Content-MD5'] = crypto.createHash('md5').update(requestData.feedContent).digest('base64');
  }

  // Make call to MWS
  request.post(options, function (error, response, body) {
    if (error) return callback(error);

    if (response.headers.hasOwnProperty('content-type') && response.headers['content-type'].startsWith('text/xml')) {
      // xml2js
      xmlParser(body, function (err, result) {
        callback(err, result);
      });
    } else {
      // currently only other type of data returned is tab-delimited text
      tabParser(body, {
        delimiter:'\t',
        columns: true,
        relax: true
      }, callback);
    }
  });
};
