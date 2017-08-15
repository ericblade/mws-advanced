const fs = require('fs');
const mws = require('..');

const keys = {
    accessKeyId: 'PUT YOUR ACCESS KEY HERE',
    secretAccessKey: 'PUT YOUR SECRET ACCESS KEY HERE',
    merchantId: 'PUT YOUR MERCHANT ID HERE',
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(accessKeys = keys) {
    console.warn('**** note due to API throttling this script may take minutes to run');
    mws.init(accessKeys);

    // get a list of all of the settlement reports, these reports are run automatically by
    // Amazon, and are not available via requestReport()
    const reportList = await mws.getReportListAll({
        ReportTypeList: [ '_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_' ],
    });
    // console.warn('**** reportList=', reportList);
    const settlement = {};
    // cycle through the list, downloading each report, and parsing it all into a single
    // object containing all of the settlement data, condensed into a more meaningful format
    // (just try reading the results logged in settlementX.json below!)
    // data is stored in settlementX.json where X is the number of the report in the list.
    // This is so we have something to analyze in case the numbers and data in the output
    // don't line up 100%.
    // Store the output data in settlement-all.json, and then give a summary at the end
    // of all the debits and credits to the account.  Output data stored, so that we can
    // compare it with input data, in case things aren't right.
    for (index in reportList) {
        console.warn('**** getting report', index);
        const settlementReport = await mws.getReport({ ReportId: reportList[index].ReportId });
        fs.writeFileSync(`settlement${index}.json`, JSON.stringify(settlementReport, null, 4));
        //console.warn('**** settlementReport=', settlementReport);
        // const settlementReport = JSON.parse(fs.readFileSync('./test.json'));

        for (const transaction of settlementReport) {
            //console.warn(transaction);
            const settlementId = transaction['settlement-id'];
            // most transactions have an order Id that they relate to.  Some transactions (FBA fees) have a shipment id that they relate to.
            // Other transactions don't seem to have any identifier at all, such as Storage Fees, so give them their own unique string ('STORAGE FEE').
            // "STORAGE FEE" is not likely the only thing that has no valid identifier, but will have to adjust this as any additional strings are discovered.
            // Whatever identifier we use is called "orderId" below, whether it's an order, or a shipment, or a fee with no identifier.
            // If we can't determine that something is a fee with no identifier to what it is attached to, or an order to attach it to, then assume it is
            // data about the entire settlement, and store it in the root of the object.
            const orderId = transaction['order-id'] || transaction['shipment-id'] || (transaction['transaction-type'] === 'Storage Fee' && 'STORAGE FEE');

            if (settlementId && !settlement[settlementId]) {
                settlement[settlementId] = { orders: {}, credits: {}, debits: {} };
            }
            if (!orderId) { // no orderId must mean the data is about the settlement itself
                for(const field in transaction) {
                    if (transaction[field]) {
                        settlement[settlementId][field] = transaction[field];
                    }
                }
            } else if (orderId) {
                // each "order" (or shipment) has credits (technically debits if negative, but all stored as credits)
                // most orders have a shipment attached to them.  Some orders may have *multiple* shipments.
                // Shipments/Orders may be completed in pieces, and therefore certain transactions will have different postedDates
                // for the same order or shipment.
                // I don't currently have any reports that seem to show the same order across multiple settlement periods,
                // so I'm not entirely certain how it would be best to handle that.
                if (!settlement[settlementId].orders[orderId]) {
                    settlement[settlementId].orders[orderId] = {};
                }
                if (!settlement[settlementId].orders[orderId].credits) {
                    settlement[settlementId].orders[orderId].credits = [];
                }
                if (!settlement[settlementId].orders[orderId].shipments) {
                    settlement[settlementId].orders[orderId].shipments = [];
                }
                if (!settlement[settlementId].orders[orderId].postedDates) {
                    settlement[settlementId].orders[orderId].postedDates = [];
                }

                // TODO: this probably shouldn't be created this deep in the hierarchy, but
                // for right now, that's the simplest way to deal with the problem this solves.
                // This solves the problem of not having to repeat a bunch of code in every
                // handler for every kind of transaction.

                function addCredit(amount, type) {
                    const isDebit = amount < 0.0;
                    if (isDebit) {
                        if (!settlement[settlementId].debits[type]) {
                            settlement[settlementId].debits[type] = 0;
                        }
                        settlement[settlementId].debits[type] += parseFloat(amount).toFixed(2) * 100;
                    } else {
                        if (!settlement[settlementId].credits[type]) {
                            settlement[settlementId].credits[type] = 0;
                        }
                        settlement[settlementId].credits[type] += parseFloat(amount).toFixed(2) * 100;
                    }
                }

                for(const field in transaction) {
                    if (transaction[field]) {
                        switch (field) {
                            case 'shipment-fee-type':
                            case 'order-fee-type':
                            case 'price-type':
                            case 'item-related-fee-type':
                            case 'promotion-type':
                            case 'direct-payment-type':
                                // associate things like "shipment-fee-type" directly to "shipment-fee-amount"
                                const arr = field.split('-');
                                const amountFieldName = (field.split('-').slice(0, -1).join('-')) + '-amount';
                                const atype = transaction[field];
                                const aamount = transaction[amountFieldName];

                                // console.warn(JSON.stringify(settlement, null, 4));
                                settlement[settlementId].orders[orderId].credits.push({ type: atype, amount: aamount });

                                addCredit(aamount, atype);

                                delete transaction[amountFieldName];
                                break;
                            case 'misc-fee-amount':
                                // "misc-fee-amount" does not have a "misc-fee-type"
                                settlement[settlementId].orders[orderId].credits.push({
                                    type: 'Misc Fee',
                                    amount: transaction[field],
                                });
                                addCredit(transaction[field], 'Misc Fee');
                                break;
                            case 'other-fee-amount':
                                // "other-fee-amount" uses "other-fee-reason-description", "transaction-type", and may have a "shipment-id" that it relates to.
                                const btype = `Other ${transaction['other-fee-reason-description']} ${transaction['transaction-type']} ${transaction['shipment-id']}`;
                                const bamount = transaction[field];

                                settlement[settlementId].orders[orderId].credits.push({
                                    type: btype,
                                    amount: bamount,
                                });
                                addCredit(bamount, btype);
                                delete transaction['other-fee-reason-description'];
                                break;
                            case 'promotion-amount':
                                // "promotion-amount" is identified by "promotion-type" and "promotion-id"
                                const ctype = `Promotion ${transaction['promotion-type']} ${transaction['promotion-id']}`;
                                const camount = transaction[field];
                                settlement[settlementId].orders[orderId].credits.push({
                                    type: ctype,
                                    amount: camount,
                                });
                                addCredit(camount, ctype);
                                delete transaction['promotion-type'];
                                delete transaction['promotion-amount'];
                                break;
                            case 'other-amount':
                                // "other-amount" may be identified by it's "transaction-type"
                                const dtype = `Other ${transaction['transaction-type']}`;
                                const damount = transaction[field];

                                settlement[settlementId].orders[orderId].credits.push({
                                    type: dtype,
                                    amount: damount,
                                });
                                addCredit(damount, dtype);
                                delete transaction['transaction-type'];
                                break;
                            // completely ignore fields that are handled in the cases *above*
                            case 'shipment-fee-amount':
                            case 'order-fee-amount':
                            case 'price-amount':
                            case 'item-related-fee-amount':
                            case 'promotion-amount':
                            case 'direct-payment-amount':
                            case 'other-fee-reason-description':
                            case 'promotion-type':
                            case 'promotion-id':
                            case 'promotion-amount':
                            case 'transaction-type':
                                break;
                            // for orders that are split up, we will receive multiple "quantity-purchased" messages, combine them into a single quantityPurchased field
                            case 'quantity-purchased':
                                if (settlement[settlementId].orders[orderId].quantityPurchased === undefined) {
                                    settlement[settlementId].orders[orderId].quantityPurchased = 0;
                                }
                                settlement[settlementId].orders[orderId].quantityPurchased += parseInt(transaction[field], 10);
                                break;

                            // add to a list of shipments that relate to the order/fee
                            case 'shipment-id':
                                if (!settlement[settlementId].orders[orderId].shipments.includes(transaction[field])) {
                                    settlement[settlementId].orders[orderId].shipments.push(transaction[field]);
                                }
                                break;

                            // add to a list of dates the transactions posted
                            case 'posted-date':
                                if (!settlement[settlementId].orders[orderId].postedDates.includes(transaction[field])) {
                                    settlement[settlementId].orders[orderId].postedDates.push(transaction[field]);
                                }
                                break;

                            // use the default field.  might want to swap the hyphens in the fieldnames for camelCase field names, to make it more javascript-y
                            // warn if we are replacing any data, because that means we have something our script isn't
                            // correctly handling.  No data should ever be *replaced*.
                            default:
                                if (settlement[settlementId].orders[orderId][field] && settlement[settlementId].orders[orderId][field] !== transaction[field]) {
                                    console.warn('***** WARNING: Replacing ', field, transaction[field], settlement[settlementId].orders[orderId][field]);
                                }
                                settlement[settlementId].orders[orderId][field] = transaction[field];
                                break;
                        }
                    }
                }
            }
        }
        console.warn('*** waiting to get next report, api has a 60 second throttle after the first 15 reports');
        await sleep(60000); // 1 request per minute limitation
    }
    fs.writeFileSync('settlement-all.json', JSON.stringify(settlement, null, 4));
    //const settlement = JSON.parse(fs.readFileSync('settlement-all.json').toString());
    const debits = {};
    const credits = {};
    let creditsTotal = 0;
    let debitsTotal = 0;
    for (const s in settlement) {
        for (const c in settlement[s].credits) {
            if (credits[c] === undefined) credits[c] = 0;
            credits[c] += settlement[s].credits[c]; // (parseFloat(settlement[s].credits[c]) + parseFloat(credits[c])).toFixed(2);
            creditsTotal += settlement[s].credits[c];
        }
        for (const d in settlement[s].debits) {
            if (debits[d] === undefined) debits[d] = 0;
            debits[d] += settlement[s].debits[d]; //(parseFloat(settlement[s].debits[d]) + parseFloat(debits[d])).toFixed(2);
            debitsTotal += settlement[s].debits[d];
        }
    }
    console.warn('** total debits', debitsTotal / 100);
    console.warn('** total credits', creditsTotal / 100);
    console.warn('*** total= ', (creditsTotal + debitsTotal) / 100);
    for (const x in debits) {
        debits[x] = (debits[x] / 100).toFixed(2);
    }
    for (const x in credits) {
        credits[x] = (credits[x] / 100).toFixed(2);
    }
    console.warn('** debits', debits);
    console.warn('** credits', credits);
}

if (require.main === module) {
    main();
} else {
    module.exports = main;
}
