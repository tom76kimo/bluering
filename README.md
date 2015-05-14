# github-contributions a.k.a bluering

A tool for fetching all contributions by user name.

# Install 
```
npm install bluering
```
# Usage
```
var bluering = require('bluering');

bluering.fetchContributions({
    login: {
        id: 'GITHUB_ID', // optional
        password: 'GITHUB_PASSWORD' // optional
    },
    userName: 'tom76kimo',
    progressCallback: function (err, data) {
        if (!err) {
            console.log('===progress===', data);
        } else {
            console.log(err.message);
        }
    },
    finalCallback: function (err, data) {
        console.log('===final===', data);
    }
});
```
