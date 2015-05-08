var request = require('request');
module.exports = function fetch(uri, callback) {
    request({
        method: 'GET',
        json: true,
        uri: uri,
        headers: {
            'User-Agent': 'request'
        }
    }, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            callback && callback(data);
        }
    });
};
