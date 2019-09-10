'use strict';

var expect = require('chai').expect,
    crypto = require('crypto-js');

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js'),
    GbaseResponse = require('../lib/objects/GbaseResponse.js');

describe('testRecordsAndLeaderboard.js', () => {
    var gbaseApiStdl;

    var vipHumanId;

    const FROM_SEGMENT = 'segma';

    describe('Signup stuff', () => {
        it('Should init api', () => {
            gbaseApiStdl = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should signup', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                vipHumanId = gbaseApiStdl.currentProfile.humanId;

                done();
            };

            gbaseApiStdl.profile.create(callbackFn);
        });
    });
    describe('Records stuff', () => {
        it(`Should try to get self record from segment "${FROM_SEGMENT}"(actually no record yet)`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.details).to.have.property('originalStatus', 404);

                done();
            };

            gbaseApiStdl.leaderboards.getSelfRecord(FROM_SEGMENT, callbackFn);
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
        it(`Should get self record from segment "${FROM_SEGMENT}"`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.rec).to.be.equal(80085);

                done();
            };

            gbaseApiStdl.leaderboards.getSelfRecord(FROM_SEGMENT, callbackFn);
        });
        it(`Should get leaderboard from segment "${FROM_SEGMENT}"`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal({ records:[{ score: 80085, hid: vipHumanId }], len: 1 });

                done();
            };

            gbaseApiStdl.leaderboards.getLeaderboardOverall(FROM_SEGMENT, 0, 20, callbackFn);
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
        it(`Should try to get self record from segment "${FROM_SEGMENT}"(deleted)`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.details).to.have.property('originalStatus', 404);

                done();
            };

            gbaseApiStdl.leaderboards.getSelfRecord(FROM_SEGMENT, callbackFn);
        });
        it(`Should add record into segment "${FROM_SEGMENT}" again`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.leaderboards.postRecord(80085, FROM_SEGMENT, callbackFn);
        });
    });
    describe('Additional records test', () => {
        const THE_VK_ID = '918007', THE_OK_ID = '537092', THE_FB_ID = '222589';

        const VK_FRIENDS = [1, 2, 3, 4, 5], OK_FRIENDS = [6, 7, 8, 9, 10], FB_FRIENDS = [11, 12, 13, 14, 15];

        var gbaseApiWebVk, gbaseApiWebOk, gbaseApiWebFb;

        it('Should init api', () => {
            gbaseApiWebVk = new GbaseApi(null, null, HMAC_SECRET, 'webvk', '0.0.2', LOCAL_ADDRESS);
            gbaseApiWebOk = new GbaseApi(null, null, HMAC_SECRET, 'webok', '0.0.2', LOCAL_ADDRESS);
            gbaseApiWebFb = new GbaseApi(null, null, HMAC_SECRET, 'webfb', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should auth web VK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            var vkSecret = crypto.enc.Hex.stringify(crypto.MD5(`12345_${THE_VK_ID}_qwerty123456`));
            gbaseApiWebVk.account.authWebVk(THE_VK_ID, vkSecret, callbackFn);
        });
        it('Should create profile for VK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebVk.profile.create(callbackFn);
        });
        it('Should auth web OK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            var wellOkSession = 'okay',
                okSecret = crypto.enc.Hex.stringify(crypto.MD5(`${THE_OK_ID}${wellOkSession}123`));
            gbaseApiWebOk.account.authWebOk(THE_OK_ID, okSecret, wellOkSession, callbackFn);
        });
        it('Should create profile for OK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebOk.profile.create(callbackFn);
        });
        it('Should signup web Facebook', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebFb.account.authFb(THE_FB_ID, callbackFn);
        });
        it('Should create profile for FB', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebFb.profile.create(callbackFn);
        });
        it('Should refresh VK friends', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebVk.leaderboards.refreshVkFriendsCache(VK_FRIENDS, callbackFn);
        });
        it('Should refresh OK friends', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebOk.leaderboards.refreshOkFriendsCache(OK_FRIENDS, callbackFn);
        });
        it('Should refresh FB friends', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebFb.leaderboards.refreshFbFriendsCache(FB_FRIENDS, callbackFn);
        });
        it('Should get rating of particular player', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal({ rec: 80085, hid: vipHumanId, rank: 1 });

                done();
            };

            gbaseApiWebVk.leaderboards.getSomeonesRating(vipHumanId, FROM_SEGMENT, callbackFn);
        });
        it('Should get leaders among friends for VK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebVk.leaderboards.getLeadersWithinFriends(FROM_SEGMENT, 0, 20, callbackFn);
        });
        it('Should get leaders among friends for OK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebOk.leaderboards.getLeadersWithinFriends(FROM_SEGMENT, 0, 20, callbackFn);
        });
        it('Should get leaders among friends for FB', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebFb.leaderboards.getLeadersWithinFriends(FROM_SEGMENT, 0, 20, callbackFn);
        });
        it('Should remove the one record again', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.leaderboards.removeSelfRecord(FROM_SEGMENT, callbackFn);
        });
    });
});