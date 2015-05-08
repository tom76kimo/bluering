var async = require('async');
var debug = require('debug')('index');
var request = require('request');
var produceUri = require('./lib/produceUri');
var isContributor = require('./lib/isContributor');
var fetch = require('./lib/fetch');
var removeDuplicates = require('./lib/removeDuplicates');

var githubContributor = function (userName) {

    var configs = {
        type: 'pr',
        is: 'merged',
        author: 'tom76kimo'
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

        for (var i = 0; i < data.items.length; ++i) {
            (function (key) {
                taskArray.push(function (callback) {
                    isContributor(data.items[key], userName, function (data) {
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

githubContributor('tom76kimo');
module.exports = githubContributor;