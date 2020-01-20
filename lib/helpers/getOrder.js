const getOrder = (api) => api.parseEndpoint((out) => out.Orders.Order)('GetOrder');

module.exports = getOrder;
