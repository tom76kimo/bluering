module.exports = function produceUri(host, configs, pageConfig) {
    var configsArray = [];
    for (var key in configs) {
        configsArray.push(key + ':' + configs[key]);
    }
    return host + configsArray.join('+') + pageConfig;
};