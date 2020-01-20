// TODO: if provide a NextToken then call ListOrdersByNextToken ?
// TODO: provide an option to automatically call ListOrdersByNextToken if NextToken is received?

const listOrders = (api) => api.parseEndpoint((out) => out.Orders.Order)('ListOrders');

module.exports = listOrders;
