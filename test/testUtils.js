'use strict';

var expect = require('chai').expect;

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js'),
    GbaseResponse = require('../lib/objects/GbaseResponse.js');

describe('testUtils.js', () => {
    var gbaseApiStdl;

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

            done();
        };

        gbaseApiStdl.profile.create(callbackFn);
    });
    it('Should get server time', done => {
        let callbackFn = (err, response) => {
            expect(err).to.be.a('null');
            expect(response).to.be.an.instanceof(GbaseResponse);

            expect(response.ok).to.be.equal(true);
            expect(response.details).to.have.property('originalResponse');

            done();
        };

        gbaseApiStdl.utils.getServerTime(callbackFn);
    });
    it('Should get current sequence', done => {
        let callbackFn = (err, response) => {
            expect(err).to.be.a('null');
            expect(response).to.be.an.instanceof(GbaseResponse);

            expect(response.ok).to.be.equal(true);
            expect(response.details.originalResponse).to.deep.equal({ sequence: 2 });

            done();
        };

        gbaseApiStdl.utils.getSequence(callbackFn);
    });
});