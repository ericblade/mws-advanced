const mws = require('..');
const keys = require('../test/keys.json');

mws.init(keys);

async function main() {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        const results = await mws.listFinancialEventsAll({ PostedAfter: startDate, MaxResultsPerPage: 10 });
        console.log('results', results);
        console.log('results shipment length', results.reduce((total, curr) => total + curr.ShipmentEventList.ShipmentEvent.length, 0));
        console.log('results refund length', results.reduce((total, curr) => {
            const currentplus = curr && curr.RefundEventList && curr.RefundEventList.ShipmentEvent.length;
           	return total + currentplus;
        }, 0));
    } catch (err) {
        console.warn('* error', err);
    }
}

main();
