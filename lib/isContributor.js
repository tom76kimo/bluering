var request = require('request');
module.exports = function isContributor (item, cb) {
	var url = item.url;
    var urlSplits = url.split('/');
    var repoOwner = urlSplits[4];
    var repoName = urlSplits[5];
    var perPage = 100;
    var page = 1;
    var pageConfig = '&per_page=' + perPage + '&page=' + page;
    var contributorUri = 'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors?' + pageConfig;
    console.log(contributorUri);
    request({
        method: 'GET',
        json: true,
        uri: contributorUri,
        headers: {
            'User-Agent': 'request'
        }
    }, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            cb && cb(data.length);
        }
    });
};