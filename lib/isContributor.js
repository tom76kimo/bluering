var debug = require('debug')('isContributor');
var request = require('request');
var fetch = require('./fetch');
var perPage = 100;
var contributorsData = [];

var recursiveRead = function (uriPrefix, page, cb) {
    var contributorUri = uriPrefix + '&page=' + page;
    debug('read...' + contributorUri);
    fetch(contributorUri, function (data) {
        if (Array.isArray(data)) {
            contributorsData = contributorsData.concat(data);
            if (data.length === 100) {
                // recursive call
                recursiveRead(uriPrefix, (page + 1), cb);
            } else {
                cb && cb(contributorsData);
            }
        } else {
            cb && cb(null);
        }
    });
};

module.exports = function isContributor (item, userName, cb) {
    var url = item.url;
    var urlSplits = url.split('/');
    var repoOwner = urlSplits[4];
    var repoName = urlSplits[5];
    var page = 1;
    var pageConfig = '&per_page=' + perPage;
    var contributorUri = 'https://api.github.com/repos/' + repoOwner +
                         '/' + repoName + '/contributors?' + pageConfig;

    if (repoOwner === userName) {
        return cb && cb(false);
    }

    contributorsData = [];

    recursiveRead(contributorUri, page, function (data) {
        if (data) {
            for (var i = 0; i < data.length; ++i) {
                if (data[i].login === userName) {
                    return cb && cb(repoName);
                }
            }
        }
        cb && cb(false);
    });
};
