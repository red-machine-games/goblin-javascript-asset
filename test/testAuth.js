'use strict';

var expect = require('chai').expect,
    crypto = require('crypto-js');

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js').GbaseApi,
    GbaseResponse = require('../lib/objects/GbaseResponse.js');

describe('testAuth.js', () => {
    var gbaseApiStdl, gbaseApiWebVk, gbaseApiWebOk;

    var gClientId, gClientSecret;

    const CUSTOM_LOGIN = 'abcd', CUSTOM_PASSWORD = '123456', THE_VK_ID = '80085', THE_OK_ID = '7175';

    describe('The case', () => {
        it('Should init api', () => {
            gbaseApiStdl = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
            gbaseApiWebVk = new GbaseApi(null, null, HMAC_SECRET, 'webvk', '0.0.2', LOCAL_ADDRESS);
            gbaseApiWebOk = new GbaseApi(null, null, HMAC_SECRET, 'webok', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should singup anon', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiStdl.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiStdl.currentAccount.gClientId).to.be.equal(response.details.originalResponse.gClientId);
                expect(gbaseApiStdl.currentAccount.gClientSecret).to.be.equal(response.details.originalResponse.gClientSecret);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                gClientId = response.details.originalResponse.gClientId;
                gClientSecret = response.details.originalResponse.gClientSecret;

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
        it('Should re-auth #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(response.details.originalResponse.gClientId).to.be.equal(gClientId);
                expect(response.details.originalResponse.gClientSecret).to.be.equal(gClientSecret);

                done();
            };

            gbaseApiStdl.account.reAuth(callbackFn);
        });
        it('Should signout #2', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should signup with custom credentials', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(response.details.originalResponse.gClientId).to.be.equal(CUSTOM_LOGIN);
                expect(response.details.originalResponse.gClientSecret).to.be.equal(CUSTOM_PASSWORD);

                done();
            };

            gbaseApiStdl.account.signupGbaseCustomCredentials(CUSTOM_LOGIN, CUSTOM_PASSWORD, callbackFn);
        });
        it('Should signout #3', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should re-auth #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(response.details.originalResponse.gClientId).to.be.equal(CUSTOM_LOGIN);
                expect(response.details.originalResponse.gClientSecret).to.be.equal(CUSTOM_PASSWORD);

                done();
            };

            gbaseApiStdl.account.reAuth(callbackFn);
        });
        it('Should signout #4', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should signin anon', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(response.details.originalResponse.gClientId).to.be.equal(gClientId);
                expect(response.details.originalResponse.gClientSecret).to.be.equal(gClientSecret);

                done();
            };

            gbaseApiStdl.account.signinGbase(gClientId, gClientSecret, callbackFn);
        });
        it('Should signout #5', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should re-auth #3', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('gClientId');
                expect(response.details.originalResponse).to.have.property('gClientSecret');
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(response.details.originalResponse.gClientId).to.be.equal(gClientId);
                expect(response.details.originalResponse.gClientSecret).to.be.equal(gClientSecret);

                done();
            };

            gbaseApiStdl.account.reAuth(callbackFn);
        });
        it('Should signout #6', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should auth web VK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('vk', THE_VK_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiWebVk.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiWebVk.currentAccount.vk).to.be.equal(response.details.originalResponse.vk);
                expect(gbaseApiWebVk.currentProfile).to.be.an('undefined');

                done();
            };

            var vkSecret = crypto.enc.Hex.stringify(crypto.MD5(`12345_${THE_VK_ID}_qwerty123456`));
            gbaseApiWebVk.account.authWebVk(THE_VK_ID, vkSecret, callbackFn);
        });
        it('Should signout #7', () => {
            gbaseApiWebVk.account.signout();

            expect(gbaseApiWebVk.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiWebVk.currentAccount).to.be.an('undefined');
            expect(gbaseApiWebVk.currentProfile).to.be.an('undefined');
        });
        it('Should re-auth #4', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('vk', THE_VK_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiWebVk.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiWebVk.currentAccount.vk).to.be.equal(response.details.originalResponse.vk);
                expect(gbaseApiWebVk.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiWebVk.account.reAuth(callbackFn);
        });
        it('Should signout #8', () => {
            gbaseApiWebVk.account.signout();

            expect(gbaseApiWebVk.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiWebVk.currentAccount).to.be.an('undefined');
            expect(gbaseApiWebVk.currentProfile).to.be.an('undefined');
        });
        it('Should auth VK SDK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('vk', THE_VK_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiStdl.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiStdl.currentAccount.vk).to.be.equal(response.details.originalResponse.vk);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.authVkSdk(THE_VK_ID, callbackFn);
        });
        it('Should signout #9', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should re-auth #5', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('vk', THE_VK_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiStdl.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiStdl.currentAccount.vk).to.be.equal(response.details.originalResponse.vk);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.reAuth(callbackFn);
        });
        it('Should signout #10', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should auth web OK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('ok', THE_OK_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiWebOk.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiWebOk.currentAccount.ok).to.be.equal(response.details.originalResponse.ok);
                expect(gbaseApiWebOk.currentProfile).to.be.an('undefined');

                done();
            };

            var wellOkSession = 'okay',
                okSecret = crypto.enc.Hex.stringify(crypto.MD5(`${THE_OK_ID}${wellOkSession}123`));
            gbaseApiWebOk.account.authWebOk(THE_OK_ID, okSecret, wellOkSession, callbackFn);
        });
        it('Should signout #11', () => {
            gbaseApiWebOk.account.signout();

            expect(gbaseApiWebOk.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiWebOk.currentAccount).to.be.an('undefined');
            expect(gbaseApiWebOk.currentProfile).to.be.an('undefined');
        });
        it('Should re-auth #6', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('ok', THE_OK_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiWebOk.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiWebOk.currentAccount.ok).to.be.equal(response.details.originalResponse.ok);
                expect(gbaseApiWebOk.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiWebOk.account.reAuth(callbackFn);
        });
        it('Should signout #12', () => {
            gbaseApiWebOk.account.signout();

            expect(gbaseApiWebOk.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiWebOk.currentAccount).to.be.an('undefined');
            expect(gbaseApiWebOk.currentProfile).to.be.an('undefined');
        });
        it('Should auth OK SDK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('ok', THE_OK_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiStdl.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiStdl.currentAccount.ok).to.be.equal(response.details.originalResponse.ok);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.authOkSdk(THE_OK_ID, callbackFn);
        });
        it('Should signout #13', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
        it('Should re-auth #7', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('ok', THE_OK_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiStdl.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiStdl.currentAccount.ok).to.be.equal(response.details.originalResponse.ok);
                expect(gbaseApiStdl.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiStdl.account.reAuth(callbackFn);
        });
        it('Should signout #14', () => {
            gbaseApiStdl.account.signout();

            expect(gbaseApiStdl.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiStdl.currentAccount).to.be.an('undefined');
            expect(gbaseApiStdl.currentProfile).to.be.an('undefined');
        });
    });
    describe('Additional case for Facebook', () => {
        const THE_FB_ID = '5230880';

        var gbaseApiWebFb;

        it('Should init api', () => {
            gbaseApiWebFb = new GbaseApi(null, null, HMAC_SECRET, 'webfb', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should auth FB', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('fb', THE_FB_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiWebFb.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiWebFb.currentAccount.fb).to.be.equal(response.details.originalResponse.fb);
                expect(gbaseApiWebFb.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiWebFb.account.authFb(THE_FB_ID, callbackFn);
        });
        it('Should signout', () => {
            gbaseApiWebFb.account.signout();

            expect(gbaseApiWebFb.currentUnicorn).to.be.an('undefined');
            expect(gbaseApiWebFb.currentAccount).to.be.an('undefined');
            expect(gbaseApiWebFb.currentProfile).to.be.an('undefined');
        });
        it('Should re-auth', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('fb', THE_FB_ID);
                expect(response.details.originalResponse).to.have.property('unicorn');

                expect(gbaseApiWebFb.currentUnicorn).to.be.equal(response.details.originalResponse.unicorn);
                expect(gbaseApiWebFb.currentAccount.fb).to.be.equal(response.details.originalResponse.fb);
                expect(gbaseApiWebFb.currentProfile).to.be.an('undefined');

                done();
            };

            gbaseApiWebFb.account.reAuth(callbackFn);
        });
    });
});

