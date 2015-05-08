var request = require('request');
var fetch = require('./fetch');
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
    fetch(contributorUri, function (data) {
        cb && cb(data.length);
    });
};
