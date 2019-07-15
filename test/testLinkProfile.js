'use strict';

var expect = require('chai').expect;

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js'),
    GbaseResponse = require('../lib/objects/GbaseResponse.js');

describe('testLinkProfile.js', () => {
    var gbaseApiStdl;

    var gClientIds = [], gClientSecrets = [];

    const THE_VK_ID = '80085', THE_OK_ID = '7175', THE_FB_ID = '678';

    var leHumanId = 0;

    describe('Signups', () => {
        it('Should init api', () => {
            gbaseApiStdl = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should signup #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                gClientIds.push(response.details.originalResponse.gClientId);
                gClientSecrets.push(response.details.originalResponse.gClientSecret);

                done();
            };

            gbaseApiStdl.account.signupGbaseAnon(callbackFn);
        });
        it('Should signout #1', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should signup #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                gClientIds.push(response.details.originalResponse.gClientId);
                gClientSecrets.push(response.details.originalResponse.gClientSecret);

                done();
            };

            gbaseApiStdl.account.signupGbaseAnon(callbackFn);
        });
        it('Should signout #2', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should signup #3', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                gClientIds.push(response.details.originalResponse.gClientId);
                gClientSecrets.push(response.details.originalResponse.gClientSecret);

                done();
            };

            gbaseApiStdl.account.signupGbaseAnon(callbackFn);
        });
        it('Should signout #3', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
    });
    describe('Linking stuff #1', () => {
        it('Should signin', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.account.signinGbase(gClientIds[0], gClientSecrets[0], callbackFn);
        });
        it('Should create profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(gbaseApiStdl.currentProfile).to.not.be.an('undefined');
                expect(gbaseApiStdl.currentProfile).to.have.property('humanId', ++leHumanId);

                done();
            };

            gbaseApiStdl.profile.create(callbackFn);
        });
        it('Should link VK profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.success).to.be.equal(true);
                expect(response.details.originalResponse.newProfile).to.be.equal(true);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.linkVkProfile(THE_VK_ID, false, callbackFn);
        });
        it('Should signin again', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.prof).to.be.equal(true);

                done();
            };

            gbaseApiStdl.account.signinGbase(gClientIds[0], gClientSecrets[0], callbackFn);
        });
        it('Should get profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal(gbaseApiStdl.currentProfile);

                expect(gbaseApiStdl.currentProfile.humanId).to.be.equal(++leHumanId);
                expect(gbaseApiStdl.currentProfile.vk).to.be.equal(THE_VK_ID);

                done();
            };

            gbaseApiStdl.profile.getp(callbackFn);
        });
        it('Should unlink', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
                expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.unlinkSocialProfile(callbackFn);
        });
    });
    describe('Linking stuff #2', () => {
        it('Should signin', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.account.signinGbase(gClientIds[1], gClientSecrets[1], callbackFn);
        });
        it('Should create profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(gbaseApiStdl.currentProfile).to.not.be.an('undefined');
                expect(gbaseApiStdl.currentProfile).to.have.property('humanId', ++leHumanId);

                done();
            };

            gbaseApiStdl.profile.create(callbackFn);
        });
        it('Should link OK profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.success).to.be.equal(true);
                expect(response.details.originalResponse.newProfile).to.be.equal(true);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.linkOkProfile(THE_OK_ID, false, callbackFn);
        });
        it('Should signin again', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.prof).to.be.equal(true);

                done();
            };

            gbaseApiStdl.account.signinGbase(gClientIds[1], gClientSecrets[1], callbackFn);
        });
        it('Should get profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal(gbaseApiStdl.currentProfile);

                expect(gbaseApiStdl.currentProfile.humanId).to.be.equal(++leHumanId);
                expect(gbaseApiStdl.currentProfile.ok).to.be.equal(THE_OK_ID);

                done();
            };

            gbaseApiStdl.profile.getp(callbackFn);
        });
        it('Should unlink', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
                expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.unlinkSocialProfile(callbackFn);
        });
    });
    describe('Linking stuff #3', () => {
        it('Should signin', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.account.signinGbase(gClientIds[2], gClientSecrets[2], callbackFn);
        });
        it('Should create profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(gbaseApiStdl.currentProfile).to.not.be.an('undefined');
                expect(gbaseApiStdl.currentProfile).to.have.property('humanId', ++leHumanId);

                done();
            };

            gbaseApiStdl.profile.create(callbackFn);
        });
        it('Should link FB profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.success).to.be.equal(true);
                expect(response.details.originalResponse.newProfile).to.be.equal(true);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.linkFbProfile(THE_FB_ID, false, callbackFn);
        });
        it('Should signin again', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.prof).to.be.equal(true);

                done();
            };

            gbaseApiStdl.account.signinGbase(gClientIds[2], gClientSecrets[2], callbackFn);
        });
        it('Should get profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal(gbaseApiStdl.currentProfile);

                expect(gbaseApiStdl.currentProfile.humanId).to.be.equal(++leHumanId);
                expect(gbaseApiStdl.currentProfile.fb).to.be.equal(THE_FB_ID);

                done();
            };

            gbaseApiStdl.profile.getp(callbackFn);
        });
        it('Should unlink', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
                expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.unlinkSocialProfile(callbackFn);
        });
    });
    describe('Bi-login linking', () => {
        const THE_VK_ID_2 = '700123', THE_OK_ID_2 = '977308', THE_FB_ID_2 = '949311';

        var gbaseApiToLinkWithVk, gbaseApiToLinkWithOk, gbaseApiToLinkWithFb;

        it('Should init api', () => {
            gClientIds = [];
            gClientSecrets = [];

            gbaseApiToLinkWithVk = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
            gbaseApiToLinkWithOk = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
            gbaseApiToLinkWithFb = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should signup for VK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                gClientIds.push(response.details.originalResponse.gClientId);
                gClientSecrets.push(response.details.originalResponse.gClientSecret);

                done();
            };

            gbaseApiToLinkWithVk.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile for VK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiToLinkWithVk.profile.create(callbackFn);
        });
        it('Should signup for OK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                gClientIds.push(response.details.originalResponse.gClientId);
                gClientSecrets.push(response.details.originalResponse.gClientSecret);

                done();
            };

            gbaseApiToLinkWithOk.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile for OK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiToLinkWithOk.profile.create(callbackFn);
        });
        it('Should signup for FB', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                gClientIds.push(response.details.originalResponse.gClientId);
                gClientSecrets.push(response.details.originalResponse.gClientSecret);

                done();
            };

            gbaseApiToLinkWithFb.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile for FB', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiToLinkWithFb.profile.create(callbackFn);
        });
        it('Should check vk profile presence', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal({ has: 1 });

                done();
            };

            gbaseApiToLinkWithVk.account.hasVkProfile(THE_VK_ID, callbackFn);
        });
        it('Should check ok profile presence', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal({ has: 1 });

                done();
            };

            gbaseApiToLinkWithOk.account.hasOkProfile(THE_OK_ID, callbackFn);
        });
        it('Should check fb profile presence', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal({ has: 1 });

                done();
            };

            gbaseApiToLinkWithFb.account.hasFbProfile(THE_FB_ID, callbackFn);
        });
        it('Should link noprof for VK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.success).to.be.equal(true);
                expect(response.details.originalResponse.newProfile).to.be.equal(false);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiToLinkWithVk.account.linkVkProfile(THE_VK_ID_2, true, callbackFn);
        });
        it('Should link noprof for OK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.success).to.be.equal(true);
                expect(response.details.originalResponse.newProfile).to.be.equal(false);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiToLinkWithOk.account.linkOkProfile(THE_OK_ID_2, true, callbackFn);
        });
        it('Should link noprof for FB', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.success).to.be.equal(true);
                expect(response.details.originalResponse.newProfile).to.be.equal(false);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiToLinkWithFb.account.linkFbProfile(THE_FB_ID_2, true, callbackFn);
        });
    });
});