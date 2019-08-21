'use strict';

var expect = require('chai').expect,
    crypto = require('crypto-js');

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js').GbaseApi,
    GbaseResponse = require('../lib/objects/GbaseResponse.js');

describe('testTickets.js', () => {
    const THE_VK_ID = 6953526, THE_OK_ID = 8151592, THE_FB_ID = 2110397;

    var gbaseApiStdl_01, gbaseApiStdl_02, gbaseApiWebVk, gbaseApiWebOk, gbaseApiFb;

    var vipHumanId;

    var stdlTicketIdToConfirm, stdlTicketIdToReject, stdlTicketIdToDischarge,
        vkTicketIdToConfirm, vkTicketIdToReject,
        okTicketIdToConfirm, okTicketIdToReject,
        fbTicketIdToConfirm, fbTicketIdToReject;

    describe('Sign up and stuff', () => {
        it('Should init api', () => {
            gbaseApiStdl_01 = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
            gbaseApiStdl_02 = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
            gbaseApiWebVk = new GbaseApi(null, null, HMAC_SECRET, 'webvk', '0.0.2', LOCAL_ADDRESS);
            gbaseApiWebOk = new GbaseApi(null, null, HMAC_SECRET, 'webok', '0.0.2', LOCAL_ADDRESS);
            gbaseApiFb = new GbaseApi(null, null, HMAC_SECRET, 'webfb', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should signup stdl #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_01.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile stdl #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_01.profile.create(callbackFn);
        });
        it('Should signup stdl #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_02.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile stdl #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                vipHumanId = gbaseApiStdl_02.currentProfile.humanId;

                done();
            };

            gbaseApiStdl_02.profile.create(callbackFn);
        });
    });
    describe('Tickets stuff', () => {
        describe('Sending and listing', () => {
            it('Standalone guy should send ticket to another standalone guy #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    stdlTicketIdToConfirm = response.details.originalResponse.tid;

                    done();
                };

                gbaseApiStdl_01.tickets.sendTicket(vipHumanId, 'confirm me', { useful: 'information' }, callbackFn);
            });
            it('Standalone guy should send ticket to VK guy #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    vkTicketIdToConfirm = response.details.originalResponse.tid;

                    done();
                };

                gbaseApiStdl_01.tickets.sendTicketVk(THE_VK_ID, 'confirm me', { useful: 'information' }, callbackFn);
            });
            it('Standalone guy should send ticket to OK guy #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    okTicketIdToConfirm = response.details.originalResponse.tid;

                    done();
                };

                gbaseApiStdl_01.tickets.sendTicketOk(THE_OK_ID, 'confirm me', { useful: 'information' }, callbackFn);
            });
            it('Standalone guy should send ticket to FB guy #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    fbTicketIdToConfirm = response.details.originalResponse.tid;

                    done();
                };

                gbaseApiStdl_01.tickets.sendTicketFb(THE_FB_ID, 'confirm me', { useful: 'information' }, callbackFn);
            });
            it('Standalone guy should list sended tickets', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.length).to.be.equal(4);

                    done();
                };

                gbaseApiStdl_01.tickets.listSendedTickets(0, 20, callbackFn);
            });
            it('Second standalone guy should list received tickets', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.length).to.be.equal(1);

                    done();
                };

                gbaseApiStdl_02.tickets.listReceivedTickets(0, 20, callbackFn);
            });
            it('Standalone guy should send ticket to another standalone guy #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    stdlTicketIdToReject = response.details.originalResponse.tid;

                    done();
                };

                gbaseApiStdl_01.tickets.sendTicket(vipHumanId, 'reject me', { unuseful: 'information' }, callbackFn);
            });
            it('Standalone guy should send ticket to VK guy #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    vkTicketIdToReject = response.details.originalResponse.tid;

                    done();
                };

                gbaseApiStdl_01.tickets.sendTicketVk(THE_VK_ID, 'reject me', { unuseful: 'information' }, callbackFn);
            });
            it('Standalone guy should send ticket to OK guy #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    okTicketIdToReject = response.details.originalResponse.tid;

                    done();
                };

                gbaseApiStdl_01.tickets.sendTicketOk(THE_OK_ID, 'reject me', { unuseful: 'information' }, callbackFn);
            });
            it('Standalone guy should send ticket to FB guy #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    fbTicketIdToReject = response.details.originalResponse.tid;

                    done();
                };

                gbaseApiStdl_01.tickets.sendTicketFb(THE_FB_ID, 'reject me', { unuseful: 'information' }, callbackFn);
            });
            it('Standalone guy should send ticket to another standalone guy #3', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    stdlTicketIdToDischarge = response.details.originalResponse.tid;

                    done();
                };

                gbaseApiStdl_01.tickets.sendTicket(vipHumanId, 'discharge me', { unuseful: 'information' }, callbackFn);
            });
        });
        describe('Sign up social guys', () => {
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
            it('Should auth FB', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiFb.account.authFb(THE_FB_ID, callbackFn);
            });
            it('Should create profile for FB', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiFb.profile.create(callbackFn);
            });
        });
        describe('Reacting on', () => {
            it('Vk guy should list received tickets', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiWebVk.tickets.listReceivedTickets(0, 20, callbackFn);
            });
            it('Vk guy should confirm ticket #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiWebVk.tickets.confirmTicketVk(vkTicketIdToConfirm, callbackFn);
            });
            it('Vk guy should reject ticket #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiWebVk.tickets.rejectTicketVk(vkTicketIdToReject, callbackFn);
            });
            it('Ok guy should list received tickets', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiWebOk.tickets.listReceivedTickets(0, 20, callbackFn);
            });
            it('Ok guy should confirm ticket #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiWebOk.tickets.confirmTicketOk(okTicketIdToConfirm, callbackFn);
            });
            it('Ok guy should reject ticket #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiWebOk.tickets.rejectTicketOk(okTicketIdToReject, callbackFn);
            });
            it('Fb guy should list received tickets', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiFb.tickets.listReceivedTickets(0, 20, callbackFn);
            });
            it('Fb guy should confirm ticket #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiFb.tickets.confirmTicketFb(fbTicketIdToConfirm, callbackFn);
            });
            it('Fb guy should reject ticket #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiFb.tickets.rejectTicketFb(fbTicketIdToReject, callbackFn);
            });
            it('Standalone guy should discharge ticket #3 for second standalone guy', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_01.tickets.dischargeTicket(stdlTicketIdToDischarge, callbackFn);
            });
            it('Second standalone guy should confirm ticket #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_02.tickets.confirmTicket(stdlTicketIdToConfirm, callbackFn);
            });
            it('Second standalone guy should reject ticket #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_02.tickets.rejectTicket(stdlTicketIdToReject, callbackFn);
            });
        });
        describe('End reactions', () => {
            it('Standalone guy should release VK ticket #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_01.tickets.releaseTicket(vkTicketIdToConfirm, callbackFn);
            });
            it('Standalone guy should dismiss VK ticket #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_01.tickets.dismissTicket(vkTicketIdToReject, callbackFn);
            });
            it('Standalone guy should release OK ticket #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_01.tickets.releaseTicket(okTicketIdToConfirm, callbackFn);
            });
            it('Standalone guy should dismiss OK ticket #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_01.tickets.dismissTicket(okTicketIdToReject, callbackFn);
            });
            it('Standalone guy should release FB ticket #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_01.tickets.releaseTicket(fbTicketIdToConfirm, callbackFn);
            });
            it('Standalone guy should dismiss FB ticket #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_01.tickets.dismissTicket(fbTicketIdToReject, callbackFn);
            });
            it('Standalone guy should release second standalone ticket #1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_01.tickets.releaseTicket(stdlTicketIdToConfirm, callbackFn);
            });
            it('Standalone guy should dismiss second standalone ticket #2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                gbaseApiStdl_01.tickets.dismissTicket(stdlTicketIdToReject, callbackFn);
            });
        });
    });
});