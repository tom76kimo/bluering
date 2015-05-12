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
        if (!err) {
            executeContributorCheck(data, userName, function (err, data) {
                if (!err) {
                    finalResults = finalResults.concat(data);
                }
                if (issueData.items.length === perPage) {
                    // maybe have more data
                    readIssues(github, userName, queryUri, (page + 1), callback);
                } else {
                    callback && callback(null, finalResults);
                }
            });
        } else {
            callback && callback(err);
        }
    });
};

var githubContributor = function (configs, callback) {
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
    var userName = configs.userName;
    var searchConfigs = {
        type: 'pr',
        is: 'merged',
        author: userName
    };
    var page = 1;
    var uri = produceUri(searchConfigs);

    debug('first fetcing url', uri);

    readIssues(github, userName, uri, page, function (err, data) {
        if (!err) {
            callback && callback(null, removeDuplicates(data));
        } else {
            callback && callback(err);
        }
    });
};

githubContributor({
    login: {
        id: 'tom76kimo',
        password: ''
    },
    userName: 'tom76kimo'
}, function (err, data) {
    if (!err) {
        console.log('===final===', data);
    } else {
        console.log(err.message);
    }
});
module.exports = githubContributor;