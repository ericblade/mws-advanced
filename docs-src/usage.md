# Usage

## Basic Usage
It is expected that you will use either async/await or Promise syntax to operate the mws-advanced API.

### async/await Example

``` js
const marketplaces = (async () => await mws.getMarketplaces())();
console.log(marketplaces);
```

### Promises Example
``` js
mws.getMarketplaces().then(marketplaces => {
    console.log(marketplaces);
});
```
Most mws-advanced functions will require at least one, if not several, parameters to function
correctly.  Most, if not all, parameters will be passed in as an object:

### Example of passing parameters in as an object
``` js
const getLastSevenDaysOrders = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    return await mws.listOrders({
        CreatedAfter: startDate,
        MarketplaceId: [ 'A2ZV50J4W1RKNI' ],
    });
};
```

## Obtaining Marketplace Values

One of the first things you should probably do after calling init, is figure out what marketplace(s)
you want your calls to operate on. Many of the MWS calls accept either a "MarketplaceId" string
parameter to operate on a single marketplace, or a "MarketplaceIdList" Array parameter to provide
operation across multiple marketplaces simultaneously.

You can do this by calling [getMarketplaces](./function/index.html#static-function-getMarketplaces/).
You probably want to store the values returned by this call somewhere for future use.

See also [Using multiple marketplaces](https://docs.developer.amazonservices.com/en_US/reports/Reports_UsingMultipleMarketplaces.html) in the Amazon MWS documentation.

## Advanced Usage

### Using an authToken to operate on someone else's MWS account

See [Using your API access for a different Amazon Seller](./getting-started.html#using-your-api-access-for-a-different-amazon-seller--authtoken-)

### Report Processing
A large document can be written on Report Processing, and probably will in the future. For right now,
please see the official MWS documentation: [Reports Overview](http://docs.developer.amazonservices.com/en_UK/reports/Reports_Overview.html)

Also, please note that the reporting functions are currently mostly just stubs, and will likely undergo
significant changes, as we use them, and discover where they are lacking.

## API call caching

For a brief period of time, this library did it's own result caching, but that was not a very good idea. For an approach you can take to caching data for long-running services, check out [cache: replace ...] https://github.com/ericblade/mws-advanced/issues/52

## Submitting data feeds

The library does support submitting data feeds, although it is in very early stages.

You can dynamically create your own feed data, and submit it using callEndpoint, by doing something like:

````
        const results = await mws.callEndpoint('SubmitFeed', {
            'MarketplaceIdList.Id.1': 'ATVPDKIKX0DER',
            FeedType: '_POST_FLAT_FILE_PRICEANDQUANTITYONLY_UPDATE_DATA_',
            feedContent:
`sku\tprice\tminimum-seller-allowed-price\tmaximum-seller-allowed-price\tquantity\thandling-time\tfulfillment-channel
PO-TON5-ZUPT\t39.99\t9.99\t199.99\t0\t\t`,
        });
        console.warn('* results', JSON.stringify(results, null, 4));
````

There is a discussion thread up to determine some approaches to improving upon this.  See [Discussion: Dynamic feed generation] (https://github.com/ericblade/mws-advanced/issues/59)

## Samples

Please see the [Samples] (https://github.com/ericblade/mws-advanced/tree/master/samples) directory
in the source repository for a large number of simple uses for the library
