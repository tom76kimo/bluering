var async = require('async');
var debug = require('debug')('index');
var request = require('request');
var produceUri = require('./lib/produceUri');
var isContributor = require('./lib/isContributor');
var fetch = require('./lib/fetch');
var removeDuplicates = require('./lib/removeDuplicates');
var extractRepoData = require('./lib/extractRepoData');

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

var githubContributor = function (configs, callback) {
    if (!configs || !configs.userName) {
        return callback && callback(new Error('no configs or userName given'));
    }
    var userName = configs.userName;
    var configs = {
        type: 'pr',
        is: 'merged',
        author: userName
    };
    var perPage = 100;
    var page = 1;
    var pageConfig = '&per_page=' + perPage + '&page=' + page;
    var host = 'https://api.github.com/search/issues?q=';
    var uri = produceUri(host, configs, pageConfig);
    var taskArray = [];

    debug('first fetcing url', uri);

    fetch(uri, function (data) {
        var totalCount = data.total_count;
        var uniqueRecord = {};
        var uniqueData = uniquelizeData(data);

        for (var i = 0; i < uniqueData.length; ++i) {
            (function (key) {
                taskArray.push(function (callback) {
                    isContributor(uniqueData[key], userName, function (data) {
                        callback(null, data);
                    });
                });
            })(i);
        }

        async.parallel(taskArray, function (err, results) {
            if (!err) {
                results = results.filter(function (entry) {
                    return !!entry;
                })
                console.log(removeDuplicates(results));
            }
        });
    });
};

githubContributor({
    userName: 'tom76kimo'
});
module.exports = githubContributor;