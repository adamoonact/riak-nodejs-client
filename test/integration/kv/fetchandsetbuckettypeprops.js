'use strict';

var Test = require('../testparams');
var StoreBucketTypeProps = require('../../../lib/commands/kv/storebuckettypeprops');
var FetchBucketTypeProps = require('../../../lib/commands/kv/fetchbuckettypeprops');
var RiakNode = require('../../../lib/core/riaknode');
var RiakCluster = require('../../../lib/core/riakcluster');
var assert = require('assert');

var bucketName = Test.bucketName + '_sp';

describe('integration-core-bucket-type-props', function() {
    var cluster;
    before(function(done) {
        cluster = Test.buildCluster(function (err, rslt) {
            done();
        });
    });
    
    after(function(done) {
        var sc = function (state) {
            if (state === RiakCluster.State.SHUTDOWN) {
                done();
            }
        };
        cluster.on('stateChange', sc);
        cluster.stop();
    });
    
    describe('store', function() {
        it('should-not-store-for-default', function(done) {
            var callback = function(err, resp) {
                assert(err, err);
                done();
            };
            var store = new StoreBucketTypeProps.Builder()
                    .withAllowMult(true)
                    .withCallback(callback)
                    .build();
            cluster.execute(store);
        });
    
        it('should-store-for-non-default', function(done) {
            var cb3 = function(err, resp) {
                assert(!err, err);
                done();
            };
            var cb2 = function(err, resp) {
                assert(!err, err);
                assert.strictEqual(resp.allowMult, false);
                assert.strictEqual(resp.nVal, 4);
                var store = new StoreBucketTypeProps.Builder()
                        .withBucketType(Test.bucketType)
                        .withAllowMult(true)
                        .withNVal(3)
                        .withCallback(cb3)
                        .build();
                cluster.execute(store);
            };
            var cb1 = function(err, resp) {
                assert(!err, err);
                var fetch = new FetchBucketTypeProps.Builder()
                    .withBucketType(Test.bucketType)
                    .withCallback(cb2)
                    .build();
                cluster.execute(fetch);
            };
            var store = new StoreBucketTypeProps.Builder()
                    .withBucketType(Test.bucketType)
                    .withAllowMult(false)
                    .withNVal(4)
                    .withCallback(cb1)
                    .build();
            cluster.execute(store);
        });
    });
    
    describe('fetch', function() {
        it('default', function(done) {
            var callback = function(err, resp) {
                assert(!err, err);
                assert(resp.nVal);
                done();
            };
            var fetch = new FetchBucketTypeProps.Builder()
                .withCallback(callback)
                .build();
            cluster.execute(fetch);
        });
        
        it('non-default', function(done) {
            var callback = function(err, resp) {
                assert(!err, err);
                assert(resp.nVal);
                done();
            };
            var fetch = new FetchBucketTypeProps.Builder()
                .withBucketType(Test.bucketType)
                .withCallback(callback)
                .build();
            cluster.execute(fetch);
        });
    });
});
