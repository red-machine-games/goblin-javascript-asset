'use strict';

var expect = require('chai').expect,
    async = require('async');

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js'),
    GbaseResponse = require('../lib/objects/GbaseResponse.js'),
    GbaseError = require('../lib/objects/GbaseError.js');

describe('testQueue.js', () => {
    const FROM_SEGMENT = 'segma';

    var gbaseApiStdl;

    var gClientId, gClientSecret;

    describe('Signup stuff', () => {
        it('Should init api', () => {
            gbaseApiStdl = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should signup', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                gClientId = response.details.originalResponse.gClientId;
                gClientSecret = response.details.originalResponse.gClientSecret;

                done();
            };

            gbaseApiStdl.account.signupGbaseAnon(callbackFn);
        });
    });
    describe('Async stuff', () => {
        const N = 100,
            SESSION_DEAD_AFTER = 29 * 1000;

        it('Should create profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.profile.create(callbackFn);
        });
        it(`Should add new record into segment "${FROM_SEGMENT}"`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.leaderboards.postRecord(80085, FROM_SEGMENT, callbackFn);
        });
        it(`Should get self profile ${N} times and self record ${N} times and all in parallel`, done => {
            let callbackFn = (err, responses) => {
                expect(err).to.be.a('null');

                for(let i = 0 ; i < N * 2 ; i++){
                    expect(responses[i].ok).to.be.equal(true);
                }

                done();
            };

            var asyncJobs = [];
            for(let i = 0 ; i < N / 2 ; i++){
                asyncJobs.push(cb => gbaseApiStdl.profile.getp(cb));
            }
            for(let i = 0 ; i < N / 2 ; i++){
                asyncJobs.push(cb => gbaseApiStdl.leaderboards.getSelfRecord(FROM_SEGMENT, cb));
            }
            for(let i = 0 ; i < N / 2 ; i++){
                asyncJobs.push(cb => gbaseApiStdl.profile.getp(cb));
            }
            for(let i = 0 ; i < N / 2 ; i++){
                asyncJobs.push(cb => gbaseApiStdl.leaderboards.getSelfRecord(FROM_SEGMENT, cb));
            }
            async.parallel(asyncJobs, callbackFn);
        });
        it('Should remove the one record', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.leaderboards.removeSelfRecord(FROM_SEGMENT, callbackFn);
        });
        it.skip('Should get "session is dead" error after some time', done => {
            setTimeout(() => {
                let callbackFn = err => {
                    expect(err).to.not.be.a('null');

                    expect(err).to.be.an.instanceof(GbaseError);
                    expect(err.code).to.be.equal(310);

                    done();
                };

                gbaseApiStdl.profile.getp(callbackFn);
            }, SESSION_DEAD_AFTER);
        });
    });
});