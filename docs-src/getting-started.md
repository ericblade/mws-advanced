# Getting Started

## Prerequisites

### Getting your MWS credentials

To use the MWS API, you will need to obtain your MWS API credentials.  Amazon will supply three
items that you will need to provide: Access Key Id, Secret Access Key, and Merchant ID.

If you do not have an Amazon Seller Central "Professional" account, you will need that to get
started. Signing up for Seller Central and information related to that is beyond the scope of this
manual, see [Amazon Seller Central](http://sellercentral.amazon.com) for specifics.

When your Amazon Seller Central account is setup, navigate to the Settings menu (upper-right-corner)
and select "User Permissions" from the drop-down menu.  After a few moments of waiting for the
entire page to finish loading, you should see a section titled "Amazon MWS Developer Permissions".
Note your Seller ID under the "Your Account Information" heading.  Then, under the
"Current Authorizations" heading, you should see as the first line, your Developer ID, Store Name,
the date you created your API authorization, and a link titled "View your credentials".

Click "View your credentials", and a pop-up will appear with your Access Key ID. Make note of this,
then click "View" next to the "Secret Key" field.  Make note of your Secret Access Key.

Now that you have your Access Key Id, Secret Access Key, and Merchant ID, you can begin using the
MWS API.

### Official MWS API documentation

You may find yourself wanting to refer to the official Amazon documentation, to determine how, when,
or why to use an API, or to find out information about what it returns, or what it is used for:

[Amazon MWS Web Service API Documentation](https://developer.amazonservices.com/gp/mws/docs.html)

## Installation

from npm:
````
npm install --save @ericblade/mws-advanced
````
from github:
````
npm install --save github:ericblade/mws-advanced
````

## Creating the connection to MWS

Before you are able to use the mws-advanced API, you must initialize it with your MWS credentials.

````
const mws = require('@ericblade/mws-advanced');
mws.init({
    accessKeyId: 'Your Amazon MWS Access Key ID',
    secretAccessKey: 'Your Amazon MWS Secret Access Key',
    merchantId: 'Your Amazon MWS Merchant ID',
});
````

## Multiple Instances

If you need multiple instances of the MWS API, such as if you are running a service that may be
making requests for multiple SellerIDs over time, you can now do:

````
const MWS = require('@ericblade/mws-advanced');
const mws = new MWS({
    accessKeyId: 'Your Amazon MWS Access Key ID',
    secretAccessKey: 'Your Amazon MWS Secret Access Key',
    merchantId: 'SellerID',
    authToken: 'Auth Token provided by other Seller',
});
````

## Calling mws-advanced APIs

mws-advanced implements several wrappers around the actual MWS API, which parse and process the XML
responses from MWS into a response format that is more easily readable in Javascript.

````
(async function() {
    const result = await mws.getMarketplaces();
    console.log(result);
})();
````

will return data that should look something like this sample data from an account that is registered
in the United States and Canadian markets:

````
{ A2EUQ1WTGCTBG2:
   { marketplaceId: 'A2EUQ1WTGCTBG2',
     defaultCountryCode: 'CA',
     domainName: 'www.amazon.ca',
     name: 'Amazon.ca',
     defaultCurrencyCode: 'CAD',
     defaultLanguageCode: 'en_CA',
     sellerId: 'SELLERIDSTRING',
     hasSellerSuspendedListings: 'No' },
  ATVPDKIKX0DER:
   { marketplaceId: 'ATVPDKIKX0DER',
     defaultCountryCode: 'US',
     domainName: 'www.amazon.com',
     name: 'Amazon.com',
     defaultCurrencyCode: 'USD',
     defaultLanguageCode: 'en_US',
     sellerId: 'SELLERIDSTRING',
     hasSellerSuspendedListings: 'No' } }
````

This looks, in my opinion, far, far better than the raw result data that results from calling MWS
"ListMarketplaceParticipations" directly, which you will see an example for in the next section.

## Calling MWS APIs directly

For APIs that have not been wrapped, or if you wish to receive the raw data output from a direct
MWS API call for some reason, you can do that with the callEndpoint function:

````
(async function() {
    const result = await mws.callEndpoint('ListMarketplaceParticipations');
    console.log(result);
})();
````

For the same user that we called in the above "getMarketplaces" API, we receive the following data
back:

````
{
    "ListMarketplaceParticipationsResponse": {
        "$": {
            "xmlns": "https://mws.amazonservices.com/Sellers/2011-07-01"
        },
        "ListMarketplaceParticipationsResult": [
            {
                "ListParticipations": [
                    {
                        "Participation": [
                            {
                                "MarketplaceId": [
                                    "A1MQXOICRS2Z7M"
                                ],
                                "SellerId": [
                                    "YOUR_SELLER_ID"
                                ],
                                "HasSellerSuspendedListings": [
                                    "No"
                                ]
                            },
                            {
                                "MarketplaceId": [
                                    "A2EUQ1WTGCTBG2"
                                ],
                                "SellerId": [
                                    "YOUR_SELLER_ID"
                                ],
                                "HasSellerSuspendedListings": [
                                    "No"
                                ]
                            },
                            {
                                "MarketplaceId": [
                                    "A2ZV50J4W1RKNI"
                                ],
                                "SellerId": [
                                    "YOUR_SELLER_ID"
                                ],
                                "HasSellerSuspendedListings": [
                                    "No"
                                ]
                            },
                            {
                                "MarketplaceId": [
                                    "ATVPDKIKX0DER"
                                ],
                                "SellerId": [
                                    "YOUR_SELLER_ID"
                                ],
                                "HasSellerSuspendedListings": [
                                    "No"
                                ]
                            }
                        ]
                    }
                ],
                "ListMarketplaces": [
                    {
                        "Marketplace": [
                            {
                                "MarketplaceId": [
                                    "A1MQXOICRS2Z7M"
                                ],
                                "DefaultCountryCode": [
                                    "CA"
                                ],
                                "DomainName": [
                                    "siprod.stores.amazon.ca"
                                ],
                                "Name": [
                                    "SI CA Prod Marketplace"
                                ],
                                "DefaultCurrencyCode": [
                                    "CAD"
                                ],
                                "DefaultLanguageCode": [
                                    "en_CA"
                                ]
                            },
                            {
                                "MarketplaceId": [
                                    "A2EUQ1WTGCTBG2"
                                ],
                                "DefaultCountryCode": [
                                    "CA"
                                ],
                                "DomainName": [
                                    "www.amazon.ca"
                                ],
                                "Name": [
                                    "Amazon.ca"
                                ],
                                "DefaultCurrencyCode": [
                                    "CAD"
                                ],
                                "DefaultLanguageCode": [
                                    "en_CA"
                                ]
                            },
                            {
                                "MarketplaceId": [
                                    "A2ZV50J4W1RKNI"
                                ],
                                "DefaultCountryCode": [
                                    "US"
                                ],
                                "DomainName": [
                                    "sim1.stores.amazon.com"
                                ],
                                "Name": [
                                    "Non-Amazon"
                                ],
                                "DefaultCurrencyCode": [
                                    "USD"
                                ],
                                "DefaultLanguageCode": [
                                    "en_US"
                                ]
                            },
                            {
                                "MarketplaceId": [
                                    "ATVPDKIKX0DER"
                                ],
                                "DefaultCountryCode": [
                                    "US"
                                ],
                                "DomainName": [
                                    "www.amazon.com"
                                ],
                                "Name": [
                                    "Amazon.com"
                                ],
                                "DefaultCurrencyCode": [
                                    "USD"
                                ],
                                "DefaultLanguageCode": [
                                    "en_US"
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        "ResponseMetadata": [
            {
                "RequestId": [
                    "9994df75-e1ec-4a59-ae71-68538df26b65"
                ]
            }
        ]
    }
}
````

... what a big difference, right?

## Using your API access for a different Amazon Seller (authToken)

Amazon provides the ability to use the MWS API for different Amazon sellers, provided that they
have authorized you with the ability to access their API account, and have provided you with an
Authorization Token to do so.  They can do this authorization via the same page that you received
your credentials from in the section titled "Getting your MWS Credentials".  Once they provide you
with the Authorization Token and THEIR Merchant ID, then you can use mws-advanced to access their
account:

````
mws.init({
    accessKeyId: 'Your Amazon MWS Access Key ID',
    secretAccessKey: 'Your Amazon MWS Secret Access Key',
    merchantId: 'THEIR MWS Merchant ID',
    authToken: 'THEIR authorization token for you',
});
````
