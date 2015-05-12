module.exports = function produceUri(configs) {
    var configsArray = [];
    for (var key in configs) {
        configsArray.push(key + ':' + configs[key]);
    }
    return configsArray.join('+');
};