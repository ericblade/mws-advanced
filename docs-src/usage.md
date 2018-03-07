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

As of March 7th, 2018, there is now an implementation for extremely simple API call caching. This is
enabled by default, as repeatedly testing the same calls over and over, while developing a major
application, was causing major headaches with throttling.

If you are using mws-advanced for some kind of long-running service process, you should call
mws.clearCallCache() occasionally, which will dump the entire contents of the cache.  I suggest setting
a 1-hour or longer interval, as the MWS service may throttle you on a request-per-hour basis. If you
do not do this, you may notice your memory usage/requirements becoming very high, if you are making
a lot of different requests.

This implementation needs a major overhaul, but it gets the job done as far as not repeating identical
calls to the MWS servers constantly.

All endpoint calls will cache the results of requests, stored in an object indexed by the parameters to the call.
Whenever an identical call is made, the results will be returned from the cache.

This does not cache any of the results of processing, so it is not ideal -- the library wrapper functions, such as
getLowestPricedOffersForAsins still must do all of their processing.
