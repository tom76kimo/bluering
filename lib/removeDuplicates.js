module.exports = function removeDuplicates (data) {
    var tempObject = {};
    if (!data || !Array.isArray(data)) {
        return [];
    }

    for (var i = 0; i < data.length; ++i) {
        tempObject[data[i]] = true;
    }

    return Object.keys(tempObject);
};