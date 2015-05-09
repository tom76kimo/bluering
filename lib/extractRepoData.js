module.exports = function extractRepoData (url) {
    var urlSplits = url.split('/');

    return {
        repoOwner: urlSplits[4],
        repoName: urlSplits[5]
    };
};