var debug = require('debug')('isContributor');
var request = require('request');
var fetch = require('./fetch');
var extractRepoData = require('./extractRepoData');
var perPage = 100;
var contributorsData = [];

var checkIsContributor = function (testData, userName) {
    if (testData) {
        for (var i = 0; i < testData.length; ++i) {
            if (testData[i].login === userName) {
                return true;
            }
        }
    }
    return false;
};

var readContributors = function (github, userName, repoOwner, repoName, page, callback) {
    debug('page: ' + page);
    github.repos.getContributors({
        user: repoOwner,
        repo: repoName,
        page: page,
        per_page: perPage
    }, function (err, data) {
        if (!err && Array.isArray(data)) {
            if (checkIsContributor(data, userName)) {
                callback && callback(null, repoOwner + '/' + repoName);
            } else if (data.length === 100) {
                // recursive call
                readContributors(github, userName, repoOwner, repoName, (page + 1), callback);
            } else {
                callback && callback(null, false);
            }
        } else {
            if (err) {
                callback && callback(err);
            } else {
                callback && callback(new Error('data from github api is invalid with repo: ' + repoOwner + '/' + repoName));
            }
        }
    });
};

module.exports = function isContributor (github, item, userName, cb) {
    var url = item.url;
    var repoData = extractRepoData(url);
    var repoOwner = repoData.repoOwner;
    var repoName = repoData.repoName;
    var page = 1;
    var pageConfig = '&per_page=' + perPage;
    var contributorUri = 'https://api.github.com/repos/' + repoOwner +
                         '/' + repoName + '/contributors?' + pageConfig;

    if (repoOwner === userName) {
        return cb && cb(false);
    }

    contributorsData = [];

    readContributors(github, userName, repoOwner, repoName, page, cb);
};
