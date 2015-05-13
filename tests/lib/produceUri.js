var expect = require('chai').expect;
var produceUri = require('../../lib/produceUri');

describe('lib', function () {
    describe('produceUri', function () {
        it('should return correct result', function () {
            var searchConfigs = {
                type: 'pr',
                is: 'merged',
                author: 'tomwu'
            };

            expect(produceUri(searchConfigs)).to.eql('type:pr+is:merged+author:tomwu');
        });
    });
});