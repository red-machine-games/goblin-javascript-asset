'use strict';

var expect = require('chai').expect,
    crypto = require('crypto-js');

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js').GbaseApi,
    GbaseResponse = require('../lib/objects/GbaseResponse.js');

describe('testProfilesStuff.js', () => {
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
    describe('Profiles stuff', () => {
        const TO_SET_PROFILE_DATA = { background: 'administration', hot: { matter: 1, parallel: 2, stereotype: 3 } },
            TO_SET_PUBLIC_PROFILE_DATA = { competition: 'piece', tell: { shoulder: 1, comprehensive: 2, outline: { wrap: 3, sight: 4 } } },
            TO_SET_VER = 2;

        var toUpdateProfileData1, toUpdatePublicProfileData1,
            toUpdateProfileData2, toUpdatePublicProfileData2;

        var vipHumanId;

        it('Should create profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.profile.create(callbackFn);
        });
        it('Should get profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal(gbaseApiStdl.currentProfile);

                done();
            };

            gbaseApiStdl.profile.getp(callbackFn);
        });
        it('Should set profileData, publicProfileData and ver', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                expect(gbaseApiStdl.currentProfile.profileData).to.deep.equal(TO_SET_PROFILE_DATA);
                expect(gbaseApiStdl.currentProfile.publicProfileData).to.deep.equal(TO_SET_PUBLIC_PROFILE_DATA);
                expect(gbaseApiStdl.currentProfile.ver).to.be.equal(TO_SET_VER);

                done();
            };

            gbaseApiStdl.profile.setp(TO_SET_PROFILE_DATA, TO_SET_PUBLIC_PROFILE_DATA, null, null, null, TO_SET_VER, callbackFn);
        });
        it('Should modify profileData and publicProfileData 1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                toUpdateProfileData1 = JSON.parse(JSON.stringify(TO_SET_PROFILE_DATA));
                toUpdateProfileData1.hot.matter = 10;
                toUpdateProfileData1.hot.stereotype = 30;

                toUpdatePublicProfileData1 = JSON.parse(JSON.stringify(TO_SET_PUBLIC_PROFILE_DATA));
                toUpdatePublicProfileData1.tell.shoulder = 10;
                toUpdatePublicProfileData1.tell.outline.wrap = 30;

                expect(gbaseApiStdl.currentProfile.profileData).to.deep.equal(toUpdateProfileData1);
                expect(gbaseApiStdl.currentProfile.publicProfileData).to.deep.equal(toUpdatePublicProfileData1);
                expect(gbaseApiStdl.currentProfile.ver).to.be.equal(TO_SET_VER);

                done();
            };

            gbaseApiStdl.profile.update(
                { 'hot.matter': 10, 'hot.stereotype': 30 },
                { 'tell.shoulder': 10, 'tell.outline.wrap': 30 },
                null, null, null, null, callbackFn
            );
        });
        it('Should modify profileData and publicProfileData 2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                toUpdateProfileData2 = JSON.parse(JSON.stringify(toUpdateProfileData1));
                toUpdateProfileData2.hot.parallel = 20;

                toUpdatePublicProfileData2 = JSON.parse(JSON.stringify(toUpdatePublicProfileData1));
                toUpdatePublicProfileData2.tell.comprehensive = 20;
                toUpdatePublicProfileData2.tell.outline.sight = 40;

                expect(gbaseApiStdl.currentProfile.profileData).to.deep.equal(toUpdateProfileData2);
                expect(gbaseApiStdl.currentProfile.publicProfileData).to.deep.equal(toUpdatePublicProfileData2);
                expect(gbaseApiStdl.currentProfile.ver).to.be.equal(TO_SET_VER);

                done();
            };

            gbaseApiStdl.profile.update(
                { 'hot.parallel': 20 }, { 'tell.comprehensive': 20, 'tell.outline.sight': 40 },
                null, null, null, null, callbackFn
            );
        });
        it('Should get profile once more', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.deep.equal(gbaseApiStdl.currentProfile);
                expect(gbaseApiStdl.currentProfile.profileData).to.deep.equal(toUpdateProfileData2);
                expect(gbaseApiStdl.currentProfile.publicProfileData).to.deep.equal(toUpdatePublicProfileData2);
                expect(gbaseApiStdl.currentProfile.ver).to.be.equal(TO_SET_VER);

                vipHumanId = gbaseApiStdl.currentProfile.humanId;

                done();
            };

            gbaseApiStdl.profile.getp(callbackFn);
        });
        it('Should get public profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.publicProfileData).to.deep.equal(toUpdatePublicProfileData2);
                expect(response.details.originalResponse.ver).to.be.equal(TO_SET_VER);

                done();
            };

            gbaseApiStdl.profile.getPublic(vipHumanId, callbackFn);
        });
    });
    describe('Aux case', () => {
        const THE_VK_ID_02 = '539955786';

        var gBase_01, gBase_02, gBase_03;

        it('Should init api #1', () => {
            gBase_01 = new GbaseApi(null, null, HMAC_SECRET, 'webvk', "0.0.1", LOCAL_ADDRESS);
        });
        it('Should auth vk #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(gBase_01.currentAccount.haveProfile).to.be.equal(false);

                done();
            };

            var vkSecret = crypto.enc.Hex.stringify(crypto.MD5(`12345_${THE_VK_ID_02}_qwerty123456`));
            gBase_01.account.authWebVk(THE_VK_ID_02, vkSecret, callbackFn);
        });
        it('Should create new profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gBase_01.profile.create(callbackFn);
        });
        it('Should init api #2 (As if it is a new play session)', () => {
            gBase_02 = new GbaseApi(null, null, HMAC_SECRET, 'webvk', "0.0.1", LOCAL_ADDRESS);
        });
        it('Should auth vk #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(gBase_02.currentAccount.haveProfile).to.be.equal(true);

                done();
            };

            var vkSecret = crypto.enc.Hex.stringify(crypto.MD5(`12345_${THE_VK_ID_02}_qwerty123456`));
            gBase_02.account.authWebVk(THE_VK_ID_02, vkSecret, callbackFn);
        });
        it('Should get previously created profile', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gBase_02.profile.getp(callbackFn);
        });
        it('Should set test profile data', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gBase_02.profile.setp({test: "hello"}, {test2: "hello2"}, null, null, null, null, callbackFn);
        });
        it('Should see new data locally', () => {
            expect(gBase_02.currentProfile.profileData).to.deep.equal({test: "hello"});
            expect(gBase_02.currentProfile.publicProfileData).to.deep.equal({test2: "hello2"});
        });
        it('Should init api #3 (As if it is a new play session again)', () => {
            gBase_03 = new GbaseApi(null, null, HMAC_SECRET, 'webvk', "0.0.1", LOCAL_ADDRESS);
        });
        it('Should auth vk #3', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(gBase_03.currentAccount.haveProfile).to.be.equal(true);

                done();
            };

            var vkSecret = crypto.enc.Hex.stringify(crypto.MD5(`12345_${THE_VK_ID_02}_qwerty123456`));
            gBase_03.account.authWebVk(THE_VK_ID_02, vkSecret, callbackFn);
        });
        it('Should get previously created profile and see new data in it', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.profileData).to.deep.equal({test: "hello"});
                expect(response.details.originalResponse.publicProfileData).to.deep.equal({test2: "hello2"});

                done();
            };

            gBase_03.profile.getp(callbackFn);
        });
        it('Should see this data locally', () => {
            expect(gBase_03.currentProfile.profileData).to.deep.equal({test: "hello"});
            expect(gBase_03.currentProfile.publicProfileData).to.deep.equal({test2: "hello2"});
        });
    });
    describe('What about working with arrays', () => {
        it('Should init api again', () => {
            gbaseApiStdl = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should signup again', done => {
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
        it('Should set an array into profileData', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl.profile.setp(
                { my_cards: [{ name: 'demonstration' }, { name: 'tower' }, { name: 'betray' }] },
                null, null, null, null, null,
                callbackFn
            );
        });
        it('Should update a second element in array', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(gbaseApiStdl.currentProfile.profileData.my_cards[1].name).to.be.equal('instinct');

                done();
            };

            gbaseApiStdl.profile.update({ 'my_cards.1.name': 'instinct' }, null, null, null, null, null, callbackFn);
        });
        it('Should get profile and see the same thing', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.profileData.my_cards[1].name).to.be.equal('instinct');
                expect(gbaseApiStdl.currentProfile.profileData.my_cards[1].name).to.be.equal('instinct');

                done();
            };

            gbaseApiStdl.profile.getp(callbackFn);
        });
    });
});