'use strict';

var expect = require('chai').expect;

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js').GbaseApi,
    GbaseResponse = require('../lib/objects/GbaseResponse.js'),
    GbaseRangePicker = require('../lib/objects/GbaseRangePicker.js');

describe('testMatchmaking.js', () => {
    var gbaseApiStdl_1, gbaseApiStdl_2;

    const FROM_SEGMENT = 'segma';

    var vipHumanId;

    describe('Sign up and stuff', () => {
        it('Should init api', () => {
            gbaseApiStdl_1 = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
            gbaseApiStdl_2 = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should signup #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_1.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_1.profile.create(callbackFn);
        });
        it(`Should add new record into segment "${FROM_SEGMENT}" #1`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_1.leaderboards.postRecord(13, FROM_SEGMENT, callbackFn);
        });
        it('Should signup #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_2.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                vipHumanId = gbaseApiStdl_2.currentProfile.humanId;

                done();
            };

            gbaseApiStdl_2.profile.create(callbackFn);
        });
        it(`Should add new record into segment "${FROM_SEGMENT}" #2`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_2.leaderboards.postRecord(37, FROM_SEGMENT, callbackFn);
        });
    });
    describe('Matchmaking', () => {
        it('First player should matchmake second player', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('humanId', vipHumanId);
                expect(response.details.originalResponse).to.have.property('ver');

                done();
            };

            gbaseApiStdl_1.matchmaking.matchPlayer(
                FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                new GbaseRangePicker('whatever').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                callbackFn
            );
        });
        it('Should remove record #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_1.leaderboards.removeSelfRecord(FROM_SEGMENT, callbackFn);
        });
        it('Should remove record #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_2.leaderboards.removeSelfRecord(FROM_SEGMENT, callbackFn);
        });
    });
});