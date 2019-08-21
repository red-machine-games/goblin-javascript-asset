'use strict';

var expect = require('chai').expect,
    crypto = require('crypto-js');

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js').GbaseApi,
    GbaseResponse = require('../lib/objects/GbaseResponse.js'),
    GbaseError = require('../lib/objects/GbaseError.js');

describe('testSocial.js', () => {
    const THE_VK_ID = 5197677, THE_OK_ID = 4816241;

    var gbaseApiWebVk, gbaseApiWebOk;

    describe('Sign up and stuff', () => {
        it('Should init api', () => {
            gbaseApiWebVk = new GbaseApi(null, null, HMAC_SECRET, 'webvk', '0.0.2', LOCAL_ADDRESS);
            gbaseApiWebOk = new GbaseApi(null, null, HMAC_SECRET, 'webok', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should signup VK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            var vkSecret = crypto.enc.Hex.stringify(crypto.MD5(`12345_${THE_VK_ID}_qwerty123456`));
            gbaseApiWebVk.account.authWebVk(THE_VK_ID, vkSecret, callbackFn);
        });
        it('Should create profile VK', done => {
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
        it('Should create profile OK', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiWebOk.profile.create(callbackFn);
        });
    });
    describe('Purchases stuff', () => {
        it('Should try get empty list of VK purchases', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal([]);

                done();
            };

            gbaseApiWebVk.social.vkListPurchases(0, 20, callbackFn);
        });
        it('Should try to consume nonexistent VK purchase and receive legit error', done => {
            let callbackFn = err => {
                expect(err).to.not.be.a('null');
                expect(err).to.be.an.instanceof(GbaseError);

                expect(err.details.body).to.deep.equal({ index: 1087, message: 'Unknown purchase' });

                done();
            };

            gbaseApiWebVk.social.vkConsumePurchase(1, callbackFn);
        });
        it('Should try get empty list of OK purchases', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal([]);

                done();
            };

            gbaseApiWebVk.social.okListPurchases(0, 20, callbackFn);
        });
        it('Should try to consume nonexistent OK purchase and receive legit error', done => {
            let callbackFn = err => {
                expect(err).to.not.be.a('null');
                expect(err).to.be.an.instanceof(GbaseError);

                expect(err.details.body).to.deep.equal({ index: 1084, message: 'Unknown purchase' });

                done();
            };

            gbaseApiWebVk.social.okConsumePurchase(1, callbackFn);
        });
    });
});