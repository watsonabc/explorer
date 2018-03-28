var request = require('request');

var base_url = 'https://www.coinexchange.io/api/v1';
function get_summary(coin, exchange, coinexchange_id, cb) {
    var summary = {};
    request({ uri: base_url + '/getmarketsummary?market_id=' + coinexchange_id, json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (body.success === "1") {
            summary['bid'] = body.result['BidPrice'];
            summary['ask'] = body.result['AskPrice'];
            summary['volume'] = body.result['Volume'];
            summary['high'] = body.result['HighPrice'];
            summary['low'] = body.result['LowPrice'];
            summary['last'] = body.result['LastPrice'];
            summary['change'] = body.result['Change'];
            return cb(null, summary);
        } else {
            return cb(error, null);
        }
    });
}

function get_orders(coin, exchange, coinexchange_id, cb) {
    var req_url = base_url + '/getorderbook?market_id=' + coinexchange_id;
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.success) {
            var orders = body.result;
            var buys = [];
            var sells = [];
            if (orders['BuyOrders'].length > 0){
                for (var i = 0; i < orders['BuyOrders'].length; i++) {
                    var order = {
                        amount: parseFloat(orders.BuyOrders[i].Quantity).toFixed(8),
                        price: parseFloat(orders.BuyOrders[i].Price).toFixed(8),
                        total: (parseFloat(orders.BuyOrders[i].Quantity).toFixed(8) * parseFloat(orders.BuyOrders[i].Price)).toFixed(8)
                    }
                    buys.push(order);
                }
            }
            if (orders['SellOrders'].length > 0) {
                for (var x = 0; x < orders['SellOrders'].length; x++) {
                    var order = {
                        amount: parseFloat(orders.SellOrders[x].Quantity).toFixed(8),
                        price: parseFloat(orders.SellOrders[x].Price).toFixed(8),
                        total: (parseFloat(orders.SellOrders[x].Quantity).toFixed(8) * parseFloat(orders.SellOrders[x].Price)).toFixed(8)
                    }
                    sells.push(order);
                }
            }
            return cb(null, buys, sells);
        } else {
            return cb(body.Message, [], [])
        }
    });
}

module.exports = {
    get_data: function (coin, exchange, coinexchange_id, cb) {
        var error = null;
        get_orders(coin, exchange, coinexchange_id, function (err, buys, sells) {
            if (err) { error = err; }
            get_summary(coin, exchange, coinexchange_id, function (err, stats) {
                if (err) { error = err; }
                return cb(error, { buys: buys, sells: sells, chartdata: [], trades: [], stats: stats });
            });
        });
    }
};

