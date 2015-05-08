var request = require('request');
var produceUri = require('./lib/produceUri');
var isContributor = require('./lib/isContributor');
var fetch = require('./lib/fetch');

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

    console.log(uri);

    fetch(uri, function (data) {
        var totalCount = data.total_count;
        isContributor(data.items[1], userName, function (data) {
            console.log(data);
        });
    });
};

githubContributor('tom76kimo');
module.exports = githubContributor;