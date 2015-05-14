var async = require('async');
var debug = require('debug')('index');
var request = require('request');
var produceUri = require('./lib/produceUri');
var isContributor = require('./lib/isContributor');
var fetch = require('./lib/fetch');
var removeDuplicates = require('./lib/removeDuplicates');
var extractRepoData = require('./lib/extractRepoData');
var GitHubApi = require("github");
var perPage = 100;
var finalResults = [];
var finalCallback;
var issueTotalPage = 0;

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: false,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    timeout: 5000,
    headers: {
        "user-agent": "Nice-App" // GitHub is happy with a unique user agent
    }
});

var uniquelizeData = function (data) {
    if (!data || !data.items || !Array.isArray(data.items)) {
        return [];
    }
    var uniqueRecord = {};
    var uniqueData = data.items.filter(function (entry) {
        if (!entry.url) {
            return false;
        }

        var repoData = extractRepoData(entry.url);
        var repoKey = repoData.repoOwner + '/' + repoData.repoName;
        if (uniqueRecord.hasOwnProperty(repoKey)) {
            return false;
        } else {
            uniqueRecord[repoKey] = true;
            return true;
        }
    });

    return uniqueData;
};

var executeContributorCheck = function (data, userName, callback) {
    var uniqueData = uniquelizeData(data);
    var taskArray = [];

    for (var i = 0; i < uniqueData.length; ++i) {
        (function (key) {
            taskArray.push(function (callback) {
                isContributor(github, uniqueData[key], userName, function (err, data) {
                    if (!err) {
                        callback(null, data);
                    } else {
                        callback(err);
                    }
                });
            });
        })(i);
    }

    async.parallel(taskArray, function (err, results) {
        if (!err) {
            results = results.filter(function (entry) {
                return !!entry;
            })
            callback && callback(null, results);
        } else {
            callback && callback(err);
        }
    });
};

var readIssues = function (github, userName, queryUri, page, callback) {
    github.search.issues({
        q: queryUri,
        page: page,
        per_page: perPage
    }, function (err, data) {
        var issueData = data;
        var totalCount;
        if (!err) {
            if (page === 1) {
                totalCount = parseInt(data.total_count, 10);
                issueTotalPage = (totalCount % perPage > 0) ? 1 : 0;
                issueTotalPage = issueTotalPage + parseInt((totalCount / perPage), 10);
            }
            executeContributorCheck(data, userName, function (err, data) {
                if (!err) {
                    finalResults = removeDuplicates(finalResults.concat(data));
                    callback && callback(null, {
                        progress: {
                            current: page,
                            total: issueTotalPage
                        },
                        contributions: finalResults
                    });
                }
                if (issueData.items.length === perPage) {
                    // maybe have more data
                    readIssues(github, userName, queryUri, (page + 1), callback);
                } else {
                    finalCallback && finalCallback(null, {
                        progress: page + '/' + issueTotalPage,
                        results: finalResults
                    });
                }
            });
        } else {
            callback && callback(err);
        }
    });
};

var fetchContributions = function (configs) {
    var callback;
    if (configs && configs.progressCallback) {
        callback = configs.progressCallback;
    }
    if (!configs || !configs.userName) {
        return callback && callback(new Error('no configs or userName given'));
    }
    if (configs.login && configs.login.id && configs.login.password) {
        try {
            github.authenticate({
                type: "basic",
                username: configs.login.id,
                password: configs.login.password
            });
        } catch (err) {
            callback && callback(err);
        }
    }
    if (configs.finalCallback) {
        finalCallback = configs.finalCallback;
    }
    var userName = configs.userName;
    var searchConfigs = {
        type: 'pr',
        is: 'merged',
        author: userName
    };
    var page = 1;
    var uri = produceUri(searchConfigs);

    debug('first fetcing url', uri);

    readIssues(github, userName, uri, page, callback);
};

module.exports = {
    fetchContributions: fetchContributions
};