var async = require('async');

var sails = require('sails');
var _ = require('lodash');

global.chai = require('chai');
global.should = chai.should();

before(function (done) {
    this.timeout(10000);

    sails.lift({
        log: {
            level: 'silent'
        },
        hooks: {
            grunt: false
        },

    }, function (err, server) {
        console.log("Sailed");
        if (err) return done(err);
        done(err, sails);
    });
});

afterEach(function (done) {
    function createDestroyCallbackFunction(element, index, array) {
        return function (callback) {
            sails.models[element].destroy({})
                .exec(function (err) {
                    callback(null, err)
                });
        };
    }

    var destroyFuncs = Object.keys(sails.models).map(createDestroyCallbackFunction);

    async.parallel(destroyFuncs, function (err, results) {
        done(err);
    });
});

after(function (done) {
    if (sails && _.isFunction(sails.lower)) {
        sails.lower(done);
    }
});