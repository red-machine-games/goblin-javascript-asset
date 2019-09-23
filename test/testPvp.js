'use strict';

var expect = require('chai').expect;

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js'),
    GbaseResponse = require('../lib/objects/GbaseResponse.js'),
    GbaseError = require('../lib/objects/GbaseError.js'),
    GbaseRangePicker = require('../lib/objects/GbaseRangePicker.js');

/**
 * To run this test and anyway play pvp you need to implement a few cloud function:
 *
 * pvpGeneratePayload.js:
 * ```
 * if(args.isA){
 *     PvpResponse({ some: 'payload a' });
 * } else if(args.isBot){
 *     PvpResponse({ some: 'payload b', alsoBot: true });
 * } else {
 *     PvpResponse({ some: 'payload b' });
 * }
 * ```
 *
 * pvpInitGameplayModel.js:
 * ```
 * PvpResponse({ plrA: args.payloadA, plrB: args.payloadB, plrAsq: 0, plrBsq: 0 });
 * ```
 *
 * pvpTurnHandler.js:
 * ```
 * var theEnd = ((args.theModel.model.plrAsq === 14 && args.isA) || (args.theModel.model.plrBsq === 14 && !args.isA));
 * if(args.isA){
 *     args.theModel.model.plrAsq++;
 *     if(!theEnd){
 *         if(args.theModel.model.plrB.alsoBot){
 *             PvpMessageHandler(args.theModel, { oppsq: args.theModel.model.plrAsq, m: args.theMessage });
 *         } else {
 *             PvpMessageHandler(args.theModel, undefined, { oppsq: args.theModel.model.plrAsq, m: args.theMessage });
 *         }
 *     }
 * } else {
 *     args.theModel.model.plrBsq++;
 *     if(!theEnd){
 *         PvpMessageHandler(args.theModel, { oppsq: args.theModel.model.plrBsq, m: args.theMessage });
 *     }
 * }
 * if(theEnd){
 *     let finalMessage = {
 *         gameIsOver: true,
 *         finalm: { m: args.theMessage, asq: args.theModel.model.plrAsq, bsq: args.theModel.model.plrBsq }
 *     };
 *     PvpMessageHandler(args.theModel, finalMessage, finalMessage);
 * }
 * ```
 *
 * pvpConnectionHandler.js:
 * ```
 * PvpResponse({
 *     isA: +args.isA,
 *     playerTurnA: args.playerTurnA, playerTurnB: args.playerTurnB,
 *     mdl: {
 *         randomSeed: args.randomSeed,
 *         startTs: args.startTs,
 *         model: args.theModel
 *     }
 * });
 * ```
 *
 * pvpDisconnectionHandler.js:
 * ```
 * PvpDisconnectionHandler({
 *     isA: +args.disconnectedIsA,
 *     playerTurnA: args.playerTurnA, playerTurnB: args.playerTurnB,
 *     theModel: args.theModel
 * });
 * ```
 *
 * pvpCheckGameOver.js:
 * ```
 * PvpResponse((args.theModel.model.plrAsq === 15 || args.theModel.model.plrBsq === 15) ? { gameIsOver: true } : null);
 * ```
 *
 * pvpGameOverHandler.js:
 * ```
 * appendBattleJournalPvp({ hello: 'world' });
 * PvpResponse();
 * ```
 *
 * pvpAutoCloseHandler.js:
 * ```
 * appendBattleJournalPvp({ looo: 'sers', lagA: args.lagA, lagB: args.lagB }, true);
 * PvpAutoDefeatResponse({ loooser: 'a' }, { loooser: 'b' });
 * ```
 *
 */

describe('testPvp.js', () => {
    const FROM_SEGMENT = 'segma';

    const EXPECTED_PROGRESS = [
            'GR: pair formed', 'GR: pair allocated. Wait for opponent', 'GR: set ready',
            'PRGS: all payloads set', 'PRGS: all players connected', 'PRGS: all players ready'
        ],
        EXPECTED_BEGIN_MESSAGE = 'GR: gameplay model established';

    const HOW_MUCH_DIRECT = 100,
        HOW_MUCH_TURNS = 15;

    var gbaseApiStdl_01, gbaseApiStdl_02;

    describe('Sign up stuff', () => {
        it('Should init api', () => {
            gbaseApiStdl_01 = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
            gbaseApiStdl_02 = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
        });
        it('Should signup #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_01.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_01.profile.create(callbackFn);
        });
        it(`Should add new record into segment "${FROM_SEGMENT}" #1`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_01.leaderboards.postRecord(12345, FROM_SEGMENT, callbackFn);
        });
        it('Should signup #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_02.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_02.profile.create(callbackFn);
        });
        it(`Should add new record into segment "${FROM_SEGMENT}" #2`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_02.leaderboards.postRecord(54321, FROM_SEGMENT, callbackFn);
        });
    });
    describe('Tricky stuff', () => {
        it('Should set the connection time gap', () => {
            gbaseApiStdl_01.pvp._deferredConnection = Math.round(Math.random() * 5) * 500;
            gbaseApiStdl_02.pvp._deferredConnection = Math.round(Math.random() * 5) * 500;
        });
    });
    describe('Player versus player', () => {
        describe('No pair', () => {
            it('First should call dropMatchmaking', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse).to.have.property('forReal');

                    done();
                };

                gbaseApiStdl_01.pvp.dropMatchmaking(callbackFn);
            });
            it('First player should search for opponent for ~6 seconds', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(false);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: timeout');

                    expect(Date.now() - startTs).to.be.at.least(6 * 1000);

                    done();
                };

                var startTs = Date.now();
                gbaseApiStdl_01.pvp.withOpponent(
                    FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    25, callbackFn
                );
            });
        });
        describe('Pair die if second no connect', () => {
            it('First should call dropMatchmaking', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse).to.have.property('forReal');

                    done();
                };

                gbaseApiStdl_01.pvp.dropMatchmaking(callbackFn);
            });
            it('Second should call dropMatchmaking', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse).to.have.property('forReal');

                    done();
                };

                gbaseApiStdl_02.pvp.dropMatchmaking(callbackFn);
            });
            it('The first should pull checkBattleNoSearch', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: neither in queue nor in battle');

                    done();
                };

                gbaseApiStdl_01.pvp.checkBattleNoSearch(callbackFn);
            });
            it('The second should pull checkBattleNoSearch', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: neither in queue nor in battle');

                    done();
                };

                gbaseApiStdl_02.pvp.checkBattleNoSearch(callbackFn);
            });

            var pvp_01, pvp_02;

            it('Both should find each other in pvp matchmaking', done => {
                let callbackFn_final = () => {
                    if(pvp_01 && pvp_02){
                        done();
                    }
                };

                let callbackFn_01 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                    pvp_01 = response.details.pvp;

                    callbackFn_final();
                };
                let callbackFn_02 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                    pvp_02 = response.details.pvp;

                    callbackFn_final();
                };

                gbaseApiStdl_01.pvp.withOpponent(
                    FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_01
                );
                gbaseApiStdl_02.pvp.withOpponent(
                    FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_02
                );
            });
            it('First should connect, get a progress and then die', done => {
                var pairAllocatedProgress = false, pairDead = false;

                let callbackFn_Progress = msg => {
                    expect(msg).to.be.equal('GR: pair allocated. Wait for opponent');

                    pairAllocatedProgress = true;
                    callbackFn();
                };
                let callbackFn_Finish = response => {
                    expect(response.ok).to.be.equal(true);
                    try{
                        expect(response.details.endMessage).to.be.equal('GR: pair dead or ttl is out');
                    } catch(__){
                        expect(response.details.endMessage).to.be.equal('Pair was not found. It\'s done or ttl is out');
                        try{
                            expect(response.details.originalResponse).to.deep.equal({ index: 380, message: 'Didn\'t found pair' });
                        } catch(__){
                            expect(response.details.originalResponse).to.deep.equal({ index: 566, message: 'Didn\'t found pair' });
                        }
                    }

                    pairDead = true;
                    callbackFn();
                };
                let callbackFn = () => {
                    if(pairAllocatedProgress && pairDead){
                        pvp_01.removeAllListeners('progress');
                        pvp_01.removeAllListeners('error');
                        pvp_01.removeAllListeners('direct-message');
                        pvp_01.removeAllListeners('finish');
                        pvp_01.removeAllListeners('model');
                        pvp_01.removeAllListeners('sync');
                        pvp_01.removeAllListeners('turn-message');
                        pvp_01.removeAllListeners('paused');
                        pvp_01.removeAllListeners('unpaused');
                        done();
                    }
                };

                pvp_01.on('progress', callbackFn_Progress);
                pvp_01.on('begin', () => done(new Error('WTF 1')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 2')));
                pvp_01.on('finish', callbackFn_Finish);
                pvp_01.on('model', () => done(new Error('WTF 3')));
                pvp_01.on('sync', () => done(new Error('WTF 4')));
                pvp_01.on('turn-message', () => done(new Error('WTF 5')));
                pvp_01.on('paused', () => done(new Error('WTF 6')));
                pvp_01.on('unpaused', () => done(new Error('WTF 7')));

                pvp_01.doConnect({ payload: '01' });
            });
            it('Second should close client-side', done => {
                let callbackFn = response => {
                    expect(response.ok).to.be.equal(true);
                    expect(response.details.endMessage).to.be.equal('Forced to close client-side');

                    done();
                };

                pvp_02.on('finish', callbackFn);
                pvp_02.forceDestroyClient();
            });
        });
        describe('Get pvp done normally', () => {
            it('First should call dropMatchmaking', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse).to.have.property('forReal');

                    done();
                };

                gbaseApiStdl_01.pvp.dropMatchmaking(callbackFn);
            });
            it('Second should call dropMatchmaking', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse).to.have.property('forReal');

                    done();
                };

                gbaseApiStdl_02.pvp.dropMatchmaking(callbackFn);
            });
            it('The first should pull checkBattleNoSearch', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: neither in queue nor in battle');

                    done();
                };

                gbaseApiStdl_01.pvp.checkBattleNoSearch(callbackFn);
            });
            it('The second should pull checkBattleNoSearch', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: neither in queue nor in battle');

                    done();
                };

                gbaseApiStdl_02.pvp.checkBattleNoSearch(callbackFn);
            });

            var pvp_01, pvp_02;

            it('Both should find each other in pvp matchmaking', done => {
                let callbackFn_final = () => {
                    if(pvp_01 && pvp_02){
                        done();
                    }
                };

                let callbackFn_01 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                    pvp_01 = response.details.pvp;

                    callbackFn_final();
                };
                let callbackFn_02 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                    pvp_02 = response.details.pvp;

                    callbackFn_final();
                };

                gbaseApiStdl_01.pvp.withOpponent(
                    FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_01
                );
                gbaseApiStdl_02.pvp.withOpponent(
                    FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_02
                );
            });
            it('Both should receive progress messages', done => {
                var begin_01 = false, begin_02 = false,
                    shouldBeModel_01 = false, shouldBeModel_02 = false,
                    beenModel_01 = false, beenModel_02 = false;

                let callbackFn_Progress = (i, msg) => {
                    expect(EXPECTED_PROGRESS).to.include(msg);
                };
                let callbackFn_Begin = (i, msg) => {
                    if(msg){
                        expect(msg).to.be.equal(EXPECTED_BEGIN_MESSAGE);
                    } else if(i === 0){
                        shouldBeModel_01 = true;
                    } else {
                        shouldBeModel_02 = true;
                    }
                    if(i === 0){
                        expect(pvp_01).to.have.property('myPing');
                        expect(pvp_01).to.have.property('opponentPing');
                        expect(pvp_01).to.have.property('isPaused', false);
                        try{
                            expect(pvp_01.opponentPayload).to.deep.equal({ some: 'payload b' });
                        } catch(__){
                            expect(pvp_01.opponentPayload).to.deep.equal({ some: 'payload a' });
                        }
                        expect(pvp_01).to.have.property('startTimestamp');
                        expect(pvp_01).to.have.property('randomSeed');
                        expect(pvp_01).to.have.property('meIsPlayerA');
                        begin_01 = true;
                        return callbackFn();
                    } else if(i === 1){
                        expect(pvp_02).to.have.property('myPing');
                        expect(pvp_02).to.have.property('opponentPing');
                        expect(pvp_02).to.have.property('isPaused', false);
                        try{
                            expect(pvp_02.opponentPayload).to.deep.equal({ some: 'payload a' });
                        } catch(__){
                            expect(pvp_02.opponentPayload).to.deep.equal({ some: 'payload b' });
                        }
                        expect(pvp_02).to.have.property('startTimestamp');
                        expect(pvp_02).to.have.property('randomSeed');
                        expect(pvp_02).to.have.property('meIsPlayerA');
                        begin_02 = true;
                        return callbackFn();
                    }
                    done(new Error('WTF 16'));
                };
                let callbackFn_Model = (i, msg) => {
                    expect(msg).to.have.property('isA');
                    expect(msg).to.have.property('mdl');
                    expect(msg).to.have.property('playerTurnA', 0);
                    expect(msg).to.have.property('playerTurnB', 0);
                    expect(msg.mdl).to.have.property('model');
                    expect(msg.mdl).to.have.property('randomSeed');
                    expect(msg.mdl).to.have.property('startTs');
                    if(i === 0){
                        expect(shouldBeModel_01).to.be.equal(true);
                        expect(beenModel_01).to.be.equal(false);
                        beenModel_01 = true;
                    } else {
                        expect(shouldBeModel_02).to.be.equal(true);
                        expect(beenModel_02).to.be.equal(false);
                        beenModel_02 = true;
                    }
                    callbackFn();
                };
                let callbackFn = () => {
                    if(begin_01 && begin_02 && (((shouldBeModel_01 && beenModel_01) || (!shouldBeModel_01))) && ((shouldBeModel_02 && beenModel_02) || (!shouldBeModel_02))){
                        pvp_01.removeAllListeners('progress');
                        pvp_01.removeAllListeners('begin');
                        pvp_01.removeAllListeners('error');
                        pvp_01.removeAllListeners('direct-message');
                        pvp_01.removeAllListeners('finish');
                        pvp_01.removeAllListeners('model');
                        pvp_01.removeAllListeners('sync');
                        pvp_01.removeAllListeners('turn-message');
                        pvp_01.removeAllListeners('paused');
                        pvp_01.removeAllListeners('unpaused');

                        pvp_02.removeAllListeners('progress');
                        pvp_02.removeAllListeners('begin');
                        pvp_02.removeAllListeners('error');
                        pvp_02.removeAllListeners('direct-message');
                        pvp_02.removeAllListeners('finish');
                        pvp_02.removeAllListeners('model');
                        pvp_02.removeAllListeners('sync');
                        pvp_02.removeAllListeners('turn-message');
                        pvp_02.removeAllListeners('paused');
                        pvp_02.removeAllListeners('unpaused');

                        done();
                    }
                };

                pvp_01.on('progress', msg => callbackFn_Progress(0, msg));
                pvp_01.on('begin', msg => callbackFn_Begin(0, msg));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 1')));
                pvp_01.on('finish', () => done(new Error('WTF 2')));
                pvp_01.on('model', msg => callbackFn_Model(0, msg));
                pvp_01.on('sync', () => done(new Error('WTF 4')));
                pvp_01.on('turn-message', () => done(new Error('WTF 5')));
                pvp_01.on('paused', () => done(new Error('WTF 6')));
                pvp_01.on('unpaused', () => done(new Error('WTF 7')));

                pvp_02.on('progress', msg => callbackFn_Progress(1, msg));
                pvp_02.on('begin', msg => callbackFn_Begin(1, msg));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 8')));
                pvp_02.on('finish', () => done(new Error('WTF 9')));
                pvp_02.on('model', msg => callbackFn_Model(1, msg));
                pvp_02.on('sync', () => done(new Error('WTF 11')));
                pvp_02.on('turn-message', () => done(new Error('WTF 12')));
                pvp_02.on('paused', () => done(new Error('WTF 13')));
                pvp_02.on('unpaused', () => done(new Error('WTF 14')));

                pvp_01.doConnect({ payload: '01' });
                pvp_02.doConnect({ payload: '02' });
            });
            it(`First player should send ${HOW_MUCH_DIRECT} direct messages and the second should receive them`, done => {
                var theMessagesCounter = 0;

                let callbackFn_Message = msg => {
                    msg = msg.message;
                    if(theMessagesCounter === msg && msg < HOW_MUCH_DIRECT){
                        if(++theMessagesCounter === HOW_MUCH_DIRECT){
                            pvp_01.removeAllListeners('progress');
                            pvp_01.removeAllListeners('begin');
                            pvp_01.removeAllListeners('error');
                            pvp_01.removeAllListeners('direct-message');
                            pvp_01.removeAllListeners('finish');
                            pvp_01.removeAllListeners('model');
                            pvp_01.removeAllListeners('sync');
                            pvp_01.removeAllListeners('turn-message');
                            pvp_01.removeAllListeners('paused');
                            pvp_01.removeAllListeners('unpaused');

                            pvp_02.removeAllListeners('progress');
                            pvp_02.removeAllListeners('begin');
                            pvp_02.removeAllListeners('error');
                            pvp_02.removeAllListeners('direct-message');
                            pvp_02.removeAllListeners('finish');
                            pvp_02.removeAllListeners('model');
                            pvp_02.removeAllListeners('sync');
                            pvp_02.removeAllListeners('turn-message');
                            pvp_02.removeAllListeners('paused');
                            pvp_02.removeAllListeners('unpaused');

                            done();
                        }
                    } else {
                        done(new Error('WTF 18'));
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', () => done(new Error('WTF 5')));
                pvp_01.on('sync', () => done(new Error('WTF 6')));
                pvp_01.on('turn-message', () => done(new Error('WTF 7')));
                pvp_01.on('paused', () => done(new Error('WTF 8')));
                pvp_01.on('unpaused', () => done(new Error('WTF 9')));

                pvp_02.on('progress', () => done(new Error('WTF 10')));
                pvp_02.on('begin', () => done(new Error('WTF 11')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', callbackFn_Message);
                pvp_02.on('finish', () => done(new Error('WTF 12')));
                pvp_02.on('model', () => done(new Error('WTF 13')));
                pvp_02.on('sync', () => done(new Error('WTF 14')));
                pvp_02.on('turn-message', () => done(new Error('WTF 15')));
                pvp_02.on('paused', () => done(new Error('WTF 16')));
                pvp_02.on('unpaused', () => done(new Error('WTF 17')));

                for(let i = 0 ; i < HOW_MUCH_DIRECT ; i++){
                    pvp_01.sendDirect(i);
                }
            });
            it(`Second player should send ${HOW_MUCH_DIRECT} direct messages and the first should receive them`, done => {
                var theMessagesCounter = 0;

                let callbackFn_Message = msg => {
                    msg = msg.message;
                    if(theMessagesCounter === msg && msg < HOW_MUCH_DIRECT){
                        if(++theMessagesCounter === HOW_MUCH_DIRECT){
                            pvp_01.removeAllListeners('progress');
                            pvp_01.removeAllListeners('begin');
                            pvp_01.removeAllListeners('error');
                            pvp_01.removeAllListeners('direct-message');
                            pvp_01.removeAllListeners('finish');
                            pvp_01.removeAllListeners('model');
                            pvp_01.removeAllListeners('sync');
                            pvp_01.removeAllListeners('turn-message');
                            pvp_01.removeAllListeners('paused');
                            pvp_01.removeAllListeners('unpaused');

                            pvp_02.removeAllListeners('progress');
                            pvp_02.removeAllListeners('begin');
                            pvp_02.removeAllListeners('error');
                            pvp_02.removeAllListeners('direct-message');
                            pvp_02.removeAllListeners('finish');
                            pvp_02.removeAllListeners('model');
                            pvp_02.removeAllListeners('sync');
                            pvp_02.removeAllListeners('turn-message');
                            pvp_02.removeAllListeners('paused');
                            pvp_02.removeAllListeners('unpaused');

                            done();
                        }
                    } else {
                        done(new Error('WTF 18'));
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', callbackFn_Message);
                pvp_01.on('finish', () => done(new Error('WTF 3')));
                pvp_01.on('model', () => done(new Error('WTF 4')));
                pvp_01.on('sync', () => done(new Error('WTF 5')));
                pvp_01.on('turn-message', () => done(new Error('WTF 6')));
                pvp_01.on('paused', () => done(new Error('WTF 7')));
                pvp_01.on('unpaused', () => done(new Error('WTF 8')));

                pvp_02.on('progress', () => done(new Error('WTF 9')));
                pvp_02.on('begin', () => done(new Error('WTF 10')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 11')));
                pvp_02.on('finish', () => done(new Error('WTF 12')));
                pvp_02.on('model', () => done(new Error('WTF 13')));
                pvp_02.on('sync', () => done(new Error('WTF 14')));
                pvp_02.on('turn-message', () => done(new Error('WTF 15')));
                pvp_02.on('paused', () => done(new Error('WTF 16')));
                pvp_02.on('unpaused', () => done(new Error('WTF 17')));

                for(let i = 0 ; i < HOW_MUCH_DIRECT ; i++){
                    pvp_02.sendDirect(i);
                }
            });
            it(`First player should make ${HOW_MUCH_TURNS - 1} turns and the second should see them`, done => {
                var theMessagesCounter = 0;

                let callbackFn_Message = msg => {
                    msg = msg.m.message;
                    if(theMessagesCounter === msg && msg < HOW_MUCH_TURNS - 1){
                        if(++theMessagesCounter === HOW_MUCH_TURNS - 1){
                            pvp_01.removeAllListeners('progress');
                            pvp_01.removeAllListeners('begin');
                            pvp_01.removeAllListeners('error');
                            pvp_01.removeAllListeners('direct-message');
                            pvp_01.removeAllListeners('finish');
                            pvp_01.removeAllListeners('model');
                            pvp_01.removeAllListeners('sync');
                            pvp_01.removeAllListeners('turn-message');
                            pvp_01.removeAllListeners('paused');
                            pvp_01.removeAllListeners('unpaused');

                            pvp_02.removeAllListeners('progress');
                            pvp_02.removeAllListeners('begin');
                            pvp_02.removeAllListeners('error');
                            pvp_02.removeAllListeners('direct-message');
                            pvp_02.removeAllListeners('finish');
                            pvp_02.removeAllListeners('model');
                            pvp_02.removeAllListeners('sync');
                            pvp_02.removeAllListeners('turn-message');
                            pvp_02.removeAllListeners('paused');
                            pvp_02.removeAllListeners('unpaused');

                            done();
                        }
                    } else {
                        done(new Error('WTF 18'));
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', () => done(new Error('WTF 5')));
                pvp_01.on('sync', () => done(new Error('WTF 6')));
                pvp_01.on('turn-message', () => done(new Error('WTF 7')));
                pvp_01.on('paused', () => done(new Error('WTF 8')));
                pvp_01.on('unpaused', () => done(new Error('WTF 9')));

                pvp_02.on('progress', () => done(new Error('WTF 10')));
                pvp_02.on('begin', () => done(new Error('WTF 11')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 12')));
                pvp_02.on('finish', () => done(new Error('WTF 13')));
                pvp_02.on('model', () => done(new Error('WTF 14')));
                pvp_02.on('sync', () => done(new Error('WTF 15')));
                pvp_02.on('turn-message', callbackFn_Message);
                pvp_02.on('paused', () => done(new Error('WTF 16')));
                pvp_02.on('unpaused', () => done(new Error('WTF 17')));

                for(let i = 0 ; i < HOW_MUCH_TURNS - 1 ; i++){
                    pvp_01.sendTurn(i);
                }
            });
            it(`Second player should make ${HOW_MUCH_TURNS - 1} turns and the first should see them`, done => {
                var theMessagesCounter = 0;

                let callbackFn_Message = msg => {
                    msg = msg.m.message;
                    if(theMessagesCounter === msg && msg < HOW_MUCH_TURNS - 1){
                        if(++theMessagesCounter === HOW_MUCH_TURNS - 1){
                            pvp_01.removeAllListeners('progress');
                            pvp_01.removeAllListeners('begin');
                            pvp_01.removeAllListeners('error');
                            pvp_01.removeAllListeners('direct-message');
                            pvp_01.removeAllListeners('finish');
                            pvp_01.removeAllListeners('model');
                            pvp_01.removeAllListeners('sync');
                            pvp_01.removeAllListeners('turn-message');
                            pvp_01.removeAllListeners('paused');
                            pvp_01.removeAllListeners('unpaused');

                            pvp_02.removeAllListeners('progress');
                            pvp_02.removeAllListeners('begin');
                            pvp_02.removeAllListeners('error');
                            pvp_02.removeAllListeners('direct-message');
                            pvp_02.removeAllListeners('finish');
                            pvp_02.removeAllListeners('model');
                            pvp_02.removeAllListeners('sync');
                            pvp_02.removeAllListeners('turn-message');
                            pvp_02.removeAllListeners('paused');
                            pvp_02.removeAllListeners('unpaused');

                            done();
                        }
                    } else {
                        done(new Error('WTF 18'));
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', () => done(new Error('WTF 5')));
                pvp_01.on('sync', () => done(new Error('WTF 6')));
                pvp_01.on('turn-message', callbackFn_Message);
                pvp_01.on('paused', () => done(new Error('WTF 7')));
                pvp_01.on('unpaused', () => done(new Error('WTF 8')));

                pvp_02.on('progress', () => done(new Error('WTF 9')));
                pvp_02.on('begin', () => done(new Error('WTF 10')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 11')));
                pvp_02.on('finish', () => done(new Error('WTF 12')));
                pvp_02.on('model', () => done(new Error('WTF 13')));
                pvp_02.on('sync', () => done(new Error('WTF 14')));
                pvp_02.on('turn-message', () => done(new Error('WTF 15')));
                pvp_02.on('paused', () => done(new Error('WTF 16')));
                pvp_02.on('unpaused', () => done(new Error('WTF 17')));

                for(let i = 0 ; i < HOW_MUCH_TURNS - 1 ; i++){
                    pvp_02.sendTurn(i);
                }
            });
            it(`First player should finalize pvp by sending ${HOW_MUCH_TURNS}th turn`, done => {
                let firstIsDone = false, secondIsDone = false;

                let callbackFn_Finish = (i, msg) => {
                    expect(msg.ok).to.be.equal(true);
                    expect(msg.details.endMessage).to.have.property('gameIsOver', true);
                    expect(msg.details.endMessage).to.have.property('finalm');
                    expect(msg.details.endMessage.finalm).to.have.property('m');
                    try{
                        expect(msg.details.endMessage.finalm).to.have.property('asq', HOW_MUCH_TURNS);
                    } catch(__){
                        expect(msg.details.endMessage.finalm).to.have.property('bsq', HOW_MUCH_TURNS);
                    }
                    try{
                        expect(msg.details.endMessage.finalm).to.have.property('bsq', HOW_MUCH_TURNS - 1);
                    } catch(__){
                        expect(msg.details.endMessage.finalm).to.have.property('asq', HOW_MUCH_TURNS - 1);
                    }
                    expect(msg.details.endMessage.finalm.m).to.deep.equal({ message: 'FIN!' });

                    if(i === 0){
                        if(!firstIsDone){
                            firstIsDone = true;
                        } else {
                            return done(new Error('WTF 17'));
                        }
                    } else if(i === 1){
                        if(!secondIsDone){
                            secondIsDone = true;
                        } else {
                            return done(new Error('WTF 18'));
                        }
                    }
                    if(firstIsDone && secondIsDone){
                        pvp_01.removeAllListeners('progress');
                        pvp_01.removeAllListeners('begin');
                        pvp_01.removeAllListeners('error');
                        pvp_01.removeAllListeners('direct-message');
                        pvp_01.removeAllListeners('finish');
                        pvp_01.removeAllListeners('model');
                        pvp_01.removeAllListeners('sync');
                        pvp_01.removeAllListeners('turn-message');
                        pvp_01.removeAllListeners('paused');
                        pvp_01.removeAllListeners('unpaused');

                        pvp_02.removeAllListeners('progress');
                        pvp_02.removeAllListeners('begin');
                        pvp_02.removeAllListeners('error');
                        pvp_02.removeAllListeners('direct-message');
                        pvp_02.removeAllListeners('finish');
                        pvp_02.removeAllListeners('model');
                        pvp_02.removeAllListeners('sync');
                        pvp_02.removeAllListeners('turn-message');
                        pvp_02.removeAllListeners('paused');
                        pvp_02.removeAllListeners('unpaused');

                        done();
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', msg => callbackFn_Finish(0, msg));
                pvp_01.on('model', () => done(new Error('WTF 4')));
                pvp_01.on('sync', () => done(new Error('WTF 5')));
                pvp_01.on('turn-message', () => done(new Error('WTF 6')));
                pvp_01.on('paused', () => done(new Error('WTF 7')));
                pvp_01.on('unpaused', () => done(new Error('WTF 8')));

                pvp_02.on('progress', () => done(new Error('WTF 9')));
                pvp_02.on('begin', () => done(new Error('WTF 10')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 11')));
                pvp_02.on('finish', msg => callbackFn_Finish(1, msg));
                pvp_02.on('model', () => done(new Error('WTF 12')));
                pvp_02.on('sync', () => done(new Error('WTF 13')));
                pvp_02.on('turn-message', () => done(new Error('WTF 14')));
                pvp_02.on('paused', () => done(new Error('WTF 15')));
                pvp_02.on('unpaused', () => done(new Error('WTF 16')));

                pvp_01.sendTurn('FIN!');
            });
            it('First player should list battle journal', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    // expect(response.details.originalResponse.l.length).to.be.equal(1);

                    done();
                };

                // We get a finish event independently of battle journal entry, so we give some penalty time to persist
                setTimeout(() => gbaseApiStdl_01.pvp.battlesList(0, 20, false, callbackFn), 1000);
            });
            it('Second player should list battle journal', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.l.length).to.be.equal(1);

                    done();
                };

                // We get a finish event independently of battle journal entry, so we give some penalty time to persist
                setTimeout(() => gbaseApiStdl_02.pvp.battlesList(0, 20, false, callbackFn), 1000);
            });
        });
        describe('Pause during gameplay', () => {
            const HOW_MUCH_TURNS = 15;

            it('First should call dropMatchmaking', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse).to.have.property('forReal');

                    done();
                };

                gbaseApiStdl_01.pvp.dropMatchmaking(callbackFn);
            });
            it('Second should call dropMatchmaking', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse).to.have.property('forReal');

                    done();
                };

                gbaseApiStdl_02.pvp.dropMatchmaking(callbackFn);
            });
            it('The first should pull checkBattleNoSearch', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: neither in queue nor in battle');

                    done();
                };

                gbaseApiStdl_01.pvp.checkBattleNoSearch(callbackFn);
            });
            it('The second should pull checkBattleNoSearch', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: neither in queue nor in battle');

                    done();
                };

                gbaseApiStdl_02.pvp.checkBattleNoSearch(callbackFn);
            });

            var pvp_01, pvp_02;

            it('Both should find each other in pvp matchmaking', done => {
                let callbackFn_final = () => {
                    if(pvp_01 && pvp_02){
                        done();
                    }
                };

                let callbackFn_01 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                    pvp_01 = response.details.pvp;

                    callbackFn_final();
                };
                let callbackFn_02 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                    pvp_02 = response.details.pvp;

                    callbackFn_final();
                };

                gbaseApiStdl_01.pvp.withOpponent(
                    FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_01
                );
                gbaseApiStdl_02.pvp.withOpponent(
                    FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_02
                );
            });
            it('Both should receive progress messages', done => {
                var begin_01 = false, begin_02 = false,
                    shouldBeModel_01 = false, shouldBeModel_02 = false,
                    beenModel_01 = false, beenModel_02 = false;

                let callbackFn_Progress = (i, msg) => {
                    expect(EXPECTED_PROGRESS).to.include(msg);
                };
                let callbackFn_Begin = (i, msg) => {
                    if(msg){
                        expect(msg).to.be.equal(EXPECTED_BEGIN_MESSAGE);
                    } else if(i === 0){
                        shouldBeModel_01 = true;
                    } else {
                        shouldBeModel_02 = true;
                    }
                    if(i === 0){
                        expect(pvp_01).to.have.property('myPing');
                        expect(pvp_01).to.have.property('opponentPing');
                        expect(pvp_01).to.have.property('isPaused', false);
                        try{
                            expect(pvp_01.opponentPayload).to.deep.equal({ some: 'payload b' });
                        } catch(__){
                            expect(pvp_01.opponentPayload).to.deep.equal({ some: 'payload a' });
                        }
                        expect(pvp_01).to.have.property('startTimestamp');
                        expect(pvp_01).to.have.property('randomSeed');
                        expect(pvp_01).to.have.property('meIsPlayerA');
                        begin_01 = true;
                        return callbackFn();
                    } else if(i === 1){
                        expect(pvp_02).to.have.property('myPing');
                        expect(pvp_02).to.have.property('opponentPing');
                        expect(pvp_02).to.have.property('isPaused', false);
                        try{
                            expect(pvp_02.opponentPayload).to.deep.equal({ some: 'payload a' });
                        } catch(__){
                            expect(pvp_02.opponentPayload).to.deep.equal({ some: 'payload b' });
                        }
                        expect(pvp_02).to.have.property('startTimestamp');
                        expect(pvp_02).to.have.property('randomSeed');
                        expect(pvp_02).to.have.property('meIsPlayerA');
                        begin_02 = true;
                        return callbackFn();
                    }
                    done(new Error('WTF 16'));
                };
                let callbackFn_Model = (i, msg) => {
                    expect(msg).to.have.property('isA');
                    expect(msg).to.have.property('mdl');
                    expect(msg).to.have.property('playerTurnA', 0);
                    expect(msg).to.have.property('playerTurnB', 0);
                    expect(msg.mdl).to.have.property('model');
                    expect(msg.mdl).to.have.property('randomSeed');
                    expect(msg.mdl).to.have.property('startTs');
                    if(i === 0){
                        expect(shouldBeModel_01).to.be.equal(true);
                        expect(beenModel_01).to.be.equal(false);
                        beenModel_01 = true;
                    } else {
                        expect(shouldBeModel_02).to.be.equal(true);
                        expect(beenModel_02).to.be.equal(false);
                        beenModel_02 = true;
                    }
                    callbackFn();
                };
                let callbackFn = () => {
                    if(begin_01 && begin_02 && (((shouldBeModel_01 && beenModel_01) || (!shouldBeModel_01))) && ((shouldBeModel_02 && beenModel_02) || (!shouldBeModel_02))){
                        pvp_01.removeAllListeners('progress');
                        pvp_01.removeAllListeners('begin');
                        pvp_01.removeAllListeners('error');
                        pvp_01.removeAllListeners('direct-message');
                        pvp_01.removeAllListeners('finish');
                        pvp_01.removeAllListeners('model');
                        pvp_01.removeAllListeners('sync');
                        pvp_01.removeAllListeners('turn-message');
                        pvp_01.removeAllListeners('paused');
                        pvp_01.removeAllListeners('unpaused');

                        pvp_02.removeAllListeners('progress');
                        pvp_02.removeAllListeners('begin');
                        pvp_02.removeAllListeners('error');
                        pvp_02.removeAllListeners('direct-message');
                        pvp_02.removeAllListeners('finish');
                        pvp_02.removeAllListeners('model');
                        pvp_02.removeAllListeners('sync');
                        pvp_02.removeAllListeners('turn-message');
                        pvp_02.removeAllListeners('paused');
                        pvp_02.removeAllListeners('unpaused');

                        done();
                    }
                };

                pvp_01.on('progress', msg => callbackFn_Progress(0, msg));
                pvp_01.on('begin', msg => callbackFn_Begin(0, msg));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 1')));
                pvp_01.on('finish', () => done(new Error('WTF 2')));
                pvp_01.on('model', msg => callbackFn_Model(0, msg));
                pvp_01.on('sync', () => done(new Error('WTF 4')));
                pvp_01.on('turn-message', () => done(new Error('WTF 5')));
                pvp_01.on('paused', () => done(new Error('WTF 6')));
                pvp_01.on('unpaused', () => done(new Error('WTF 7')));

                pvp_02.on('progress', msg => callbackFn_Progress(1, msg));
                pvp_02.on('begin', msg => callbackFn_Begin(1, msg));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 8')));
                pvp_02.on('finish', () => done(new Error('WTF 9')));
                pvp_02.on('model', msg => callbackFn_Model(1, msg));
                pvp_02.on('sync', () => done(new Error('WTF 11')));
                pvp_02.on('turn-message', () => done(new Error('WTF 12')));
                pvp_02.on('paused', () => done(new Error('WTF 13')));
                pvp_02.on('unpaused', () => done(new Error('WTF 14')));

                pvp_01.doConnect({ payload: '01' });
                pvp_02.doConnect({ payload: '02' });
            });
            it(`First player should make ${HOW_MUCH_TURNS - 1} turns and the second should see them`, done => {
                var theMessagesCounter = 0;

                let callbackFn_Message = msg => {
                    msg = msg.m.message;
                    if(theMessagesCounter === msg && msg < HOW_MUCH_TURNS - 1){
                        if(++theMessagesCounter === HOW_MUCH_TURNS - 1){
                            pvp_01.removeAllListeners('progress');
                            pvp_01.removeAllListeners('begin');
                            pvp_01.removeAllListeners('error');
                            pvp_01.removeAllListeners('direct-message');
                            pvp_01.removeAllListeners('finish');
                            pvp_01.removeAllListeners('model');
                            pvp_01.removeAllListeners('sync');
                            pvp_01.removeAllListeners('turn-message');
                            pvp_01.removeAllListeners('paused');
                            pvp_01.removeAllListeners('unpaused');

                            pvp_02.removeAllListeners('progress');
                            pvp_02.removeAllListeners('begin');
                            pvp_02.removeAllListeners('error');
                            pvp_02.removeAllListeners('direct-message');
                            pvp_02.removeAllListeners('finish');
                            pvp_02.removeAllListeners('model');
                            pvp_02.removeAllListeners('sync');
                            pvp_02.removeAllListeners('turn-message');
                            pvp_02.removeAllListeners('paused');
                            pvp_02.removeAllListeners('unpaused');

                            done();
                        }
                    } else {
                        done(new Error('WTF 18'));
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', () => done(new Error('WTF 5')));
                pvp_01.on('sync', () => done(new Error('WTF 6')));
                pvp_01.on('turn-message', () => done(new Error('WTF 7')));
                pvp_01.on('paused', () => done(new Error('WTF 8')));
                pvp_01.on('unpaused', () => done(new Error('WTF 9')));

                pvp_02.on('progress', () => done(new Error('WTF 10')));
                pvp_02.on('begin', () => done(new Error('WTF 11')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 12')));
                pvp_02.on('finish', () => done(new Error('WTF 13')));
                pvp_02.on('model', () => done(new Error('WTF 14')));
                pvp_02.on('sync', () => done(new Error('WTF 15')));
                pvp_02.on('turn-message', callbackFn_Message);
                pvp_02.on('paused', () => done(new Error('WTF 16')));
                pvp_02.on('unpaused', () => done(new Error('WTF 17')));

                for(let i = 0 ; i < HOW_MUCH_TURNS - 1 ; i++){
                    pvp_01.sendTurn(i);
                }
            });
            it(`Second player should make ${HOW_MUCH_TURNS - 1} turns and the first should see them`, done => {
                var theMessagesCounter = 0;

                let callbackFn_Message = msg => {
                    msg = msg.m.message;
                    if(theMessagesCounter === msg && msg < HOW_MUCH_TURNS - 1){
                        if(++theMessagesCounter === HOW_MUCH_TURNS - 1){
                            pvp_01.removeAllListeners('progress');
                            pvp_01.removeAllListeners('begin');
                            pvp_01.removeAllListeners('error');
                            pvp_01.removeAllListeners('direct-message');
                            pvp_01.removeAllListeners('finish');
                            pvp_01.removeAllListeners('model');
                            pvp_01.removeAllListeners('sync');
                            pvp_01.removeAllListeners('turn-message');
                            pvp_01.removeAllListeners('paused');
                            pvp_01.removeAllListeners('unpaused');

                            pvp_02.removeAllListeners('progress');
                            pvp_02.removeAllListeners('begin');
                            pvp_02.removeAllListeners('error');
                            pvp_02.removeAllListeners('direct-message');
                            pvp_02.removeAllListeners('finish');
                            pvp_02.removeAllListeners('model');
                            pvp_02.removeAllListeners('sync');
                            pvp_02.removeAllListeners('turn-message');
                            pvp_02.removeAllListeners('paused');
                            pvp_02.removeAllListeners('unpaused');

                            done();
                        }
                    } else {
                        done(new Error('WTF 18'));
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', () => done(new Error('WTF 5')));
                pvp_01.on('sync', () => done(new Error('WTF 6')));
                pvp_01.on('turn-message', callbackFn_Message);
                pvp_01.on('paused', () => done(new Error('WTF 7')));
                pvp_01.on('unpaused', () => done(new Error('WTF 8')));

                pvp_02.on('progress', () => done(new Error('WTF 9')));
                pvp_02.on('begin', () => done(new Error('WTF 10')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 11')));
                pvp_02.on('finish', () => done(new Error('WTF 12')));
                pvp_02.on('model', () => done(new Error('WTF 13')));
                pvp_02.on('sync', () => done(new Error('WTF 14')));
                pvp_02.on('turn-message', () => done(new Error('WTF 15')));
                pvp_02.on('paused', () => done(new Error('WTF 16')));
                pvp_02.on('unpaused', () => done(new Error('WTF 17')));

                for(let i = 0 ; i < HOW_MUCH_TURNS - 1 ; i++){
                    pvp_02.sendTurn(i);
                }
            });
            it('First player should force disconnect and both should see the pause', done => {
                var pauseArguments1, pauseArguments2;

                let callbackFn = () => {
                    if(pauseArguments1 && pauseArguments2){
                        expect(pauseArguments1[0]).to.be.equal('Game paused due to disconnection');
                        expect(pauseArguments1[1]).to.be.an('undefined');
                        expect(pauseArguments1[2]).to.be.an('undefined');

                        expect(pauseArguments2[0]).to.have.property('isA');
                        expect(pauseArguments2[0]).to.have.property('playerTurnA');
                        expect(pauseArguments2[0]).to.have.property('playerTurnB');
                        expect(pauseArguments2[0]).to.have.property('theModel');
                        expect(pauseArguments2[1]).to.be.above(0);
                        expect(pauseArguments2[2]).to.be.an('undefined');

                        setTimeout(() => {
                            pvp_01.removeAllListeners('progress');
                            pvp_01.removeAllListeners('begin');
                            pvp_01.removeAllListeners('error');
                            pvp_01.removeAllListeners('direct-message');
                            pvp_01.removeAllListeners('finish');
                            pvp_01.removeAllListeners('model');
                            pvp_01.removeAllListeners('sync');
                            pvp_01.removeAllListeners('turn-message');
                            pvp_01.removeAllListeners('paused');
                            pvp_01.removeAllListeners('unpaused');

                            pvp_02.removeAllListeners('progress');
                            pvp_02.removeAllListeners('begin');
                            pvp_02.removeAllListeners('error');
                            pvp_02.removeAllListeners('direct-message');
                            pvp_02.removeAllListeners('finish');
                            pvp_02.removeAllListeners('model');
                            pvp_02.removeAllListeners('sync');
                            pvp_02.removeAllListeners('turn-message');
                            pvp_02.removeAllListeners('paused');
                            pvp_02.removeAllListeners('unpaused');

                            done();
                        }, 1000);
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', () => done(new Error('WTF 5')));
                pvp_01.on('sync', () => done(new Error('WTF 6')));
                pvp_01.on('turn-message', () => done(new Error('WTF 7')));
                pvp_01.on('paused', (theMessage, ts1, ts2) => {
                    pauseArguments1 = [theMessage, ts1, ts2];
                    callbackFn();
                });
                pvp_01.on('unpaused', () => done(new Error('WTF 9')));

                pvp_02.on('progress', () => done(new Error('WTF 10')));
                pvp_02.on('begin', () => done(new Error('WTF 11')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 12')));
                pvp_02.on('finish', () => done(new Error('WTF 13')));
                pvp_02.on('model', () => done(new Error('WTF 14')));
                pvp_02.on('sync', () => done(new Error('WTF 15')));
                pvp_02.on('turn-message', () => done(new Error('WTF 16')));
                pvp_02.on('paused', (theMessage, ts1, ts2) => {
                    pauseArguments2 = [theMessage, ts1, ts2];
                    callbackFn();
                });
                pvp_02.on('unpaused', () => done(new Error('WTF 17')));

                pvp_01.forceDisconnect();
            });
            it('Second should try to send message during pause', () => {
                try{
                    pvp_02.sendTurn('la message');
                } catch(errImExpecting){
                    expect(errImExpecting).to.be.instanceof(GbaseError);
                    expect(errImExpecting).to.have.property('code', 138);
                    return;
                }
                throw new Error('WTF');
            });
            it('First player should reconnect and both should see unpaused with the same timestamp', done => {
                let gotUnpaused1 = false, gotUnpaused2 = false, gotModel = false,
                    unpauseTs1, unpauseTs2,
                    pauseTs1, pauseTs2;

                let callbackFn_Unpause1 = (msg, at, from) => {
                    expect(at).to.be.above(0);
                    expect(from).to.be.above(0);
                    expect(msg).to.be.equal('GR: opponent connected');

                    gotUnpaused1 = true;
                    unpauseTs1 = at;
                    pauseTs1 = from;
                    callbackFn();
                };
                let callbackFn_Unpause2 = (msg, at, from) => {
                    expect(at).to.be.above(0);
                    expect(from).to.be.above(0);
                    expect(msg).to.be.a('null');

                    gotUnpaused2 = true;
                    unpauseTs2 = at;
                    pauseTs2 = from;
                    callbackFn();
                };
                let callbackFn_Model = msg => {
                    expect(msg).to.have.property('mdl');
                    expect(msg).to.have.property('isA');
                    expect(msg).to.have.property('playerTurnA');
                    expect(msg).to.have.property('playerTurnB');
                    expect(msg.mdl).to.have.property('randomSeed');
                    expect(msg.mdl).to.have.property('startTs');
                    expect(msg.mdl).to.have.property('model');

                    gotModel = true;
                    callbackFn();
                };
                let callbackFn = () => {
                    if(gotUnpaused1 && gotUnpaused2 && gotModel){
                        expect(unpauseTs1).to.be.equal(unpauseTs2);
                        expect(pauseTs1).to.be.equal(pauseTs2);

                        pvp_01.removeAllListeners('progress');
                        pvp_01.removeAllListeners('begin');
                        pvp_01.removeAllListeners('error');
                        pvp_01.removeAllListeners('direct-message');
                        pvp_01.removeAllListeners('finish');
                        pvp_01.removeAllListeners('model');
                        pvp_01.removeAllListeners('sync');
                        pvp_01.removeAllListeners('turn-message');
                        pvp_01.removeAllListeners('paused');
                        pvp_01.removeAllListeners('unpaused');

                        pvp_02.removeAllListeners('progress');
                        pvp_02.removeAllListeners('begin');
                        pvp_02.removeAllListeners('error');
                        pvp_02.removeAllListeners('direct-message');
                        pvp_02.removeAllListeners('finish');
                        pvp_02.removeAllListeners('model');
                        pvp_02.removeAllListeners('sync');
                        pvp_02.removeAllListeners('turn-message');
                        pvp_02.removeAllListeners('paused');
                        pvp_02.removeAllListeners('unpaused');

                        done();
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', callbackFn_Model);
                pvp_01.on('sync', () => done(new Error('WTF 5')));
                pvp_01.on('turn-message', () => done(new Error('WTF 6')));
                pvp_01.on('paused', () => done(new Error('WTF 7')));
                pvp_01.on('unpaused', callbackFn_Unpause2);

                pvp_02.on('progress', () => done(new Error('WTF 9')));
                pvp_02.on('begin', () => done(new Error('WTF 10')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 11')));
                pvp_02.on('finish', () => done(new Error('WTF 12')));
                pvp_02.on('model', () => done(new Error('WTF 13')));
                pvp_02.on('sync', () => done(new Error('WTF 14')));
                pvp_02.on('turn-message', () => done(new Error('WTF 15')));
                pvp_02.on('paused', () => done(new Error('WTF 16')));
                pvp_02.on('unpaused', callbackFn_Unpause1);

                pvp_01.reconnect();
            });
            it('Second player should destroy pvp client', done => {
                var gotFinish = false, pauseArguments1, pauseArguments2,
                    gotPaused = false;

                let callbackFn_Finish = response => {
                    expect(response.ok).to.be.equal(true);
                    expect(response.details.endMessage).to.be.equal('Forced to close client-side');

                    gotFinish = true;
                    callbackFn();
                };
                let callbackFn_Paused = () => {
                    if(pauseArguments1 && pauseArguments2){
                        expect(pauseArguments1[0]).to.have.property('isA');
                        expect(pauseArguments1[0]).to.have.property('playerTurnA');
                        expect(pauseArguments1[0]).to.have.property('playerTurnB');
                        expect(pauseArguments1[0]).to.have.property('theModel');
                        expect(pauseArguments1[1]).to.be.above(0);
                        expect(pauseArguments1[2]).to.be.an('undefined');

                        expect(pauseArguments2[0]).to.be.equal('Game paused due to disconnection');
                        expect(pauseArguments2[1]).to.be.an('undefined');
                        expect(pauseArguments2[2]).to.be.an('undefined');

                        gotPaused = true;
                        callbackFn();
                    }
                };
                let callbackFn = () => {
                    if(gotFinish && gotPaused){
                        setTimeout(() => {
                            pvp_01.removeAllListeners('progress');
                            pvp_01.removeAllListeners('begin');
                            pvp_01.removeAllListeners('error');
                            pvp_01.removeAllListeners('direct-message');
                            pvp_01.removeAllListeners('finish');
                            pvp_01.removeAllListeners('model');
                            pvp_01.removeAllListeners('sync');
                            pvp_01.removeAllListeners('turn-message');
                            pvp_01.removeAllListeners('paused');
                            pvp_01.removeAllListeners('unpaused');

                            pvp_02.removeAllListeners('progress');
                            pvp_02.removeAllListeners('begin');
                            pvp_02.removeAllListeners('error');
                            pvp_02.removeAllListeners('direct-message');
                            pvp_02.removeAllListeners('finish');
                            pvp_02.removeAllListeners('model');
                            pvp_02.removeAllListeners('sync');
                            pvp_02.removeAllListeners('turn-message');
                            pvp_02.removeAllListeners('paused');
                            pvp_02.removeAllListeners('unpaused');

                            done();
                        }, 1000);
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', () => done(new Error('WTF 5')));
                pvp_01.on('sync', () => done(new Error('WTF 6')));
                pvp_01.on('turn-message', () => done(new Error('WTF 7')));
                pvp_01.on('paused', (theMessage, ts1, ts2) => {
                    pauseArguments1 = [theMessage, ts1, ts2];
                    callbackFn_Paused();
                });
                pvp_01.on('unpaused', () => done(new Error('WTF 8')));

                pvp_02.on('progress', () => done(new Error('WTF 9')));
                pvp_02.on('begin', () => done(new Error('WTF 10')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 11')));
                pvp_02.on('finish', callbackFn_Finish);
                pvp_02.on('model', () => done(new Error('WTF 12')));
                pvp_02.on('sync', () => done(new Error('WTF 13')));
                pvp_02.on('turn-message', () => done(new Error('WTF 14')));
                pvp_02.on('paused', (theMessage, ts1, ts2) => {
                    pauseArguments2 = [theMessage, ts1, ts2];
                    callbackFn_Paused();
                });
                pvp_02.on('unpaused', () => done(new Error('WTF 16')));

                pvp_02.forceDestroyClient();
            });

            var pvpRoomData;

            it('The second should pull checkBattleNoSearch', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                    pvpRoomData = response.details.originalResponse;

                    done();
                };

                gbaseApiStdl_02.pvp.checkBattleNoSearch(callbackFn);
            });
            it('The second should rebuild his lost pvp', done => {
                var connect = false, unpauseArguments1, unpauseArguments2,
                    unpaused = false, theBegin = false, theSync = false;

                let callbackFn_Connect = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details).to.have.property('pvp');

                    pvp_02 = response.details.pvp;

                    pvp_02.on('progress', () => done(new Error('WTF 9')));
                    pvp_02.on('begin', callbackFn_Begin);
                    pvp_02.on('error', err => done(err));
                    pvp_02.on('direct-message', () => done(new Error('WTF 11')));
                    pvp_02.on('finish', () => done(new Error('WTF 12')));
                    pvp_02.on('model', () => done(new Error('WTF 13')));
                    pvp_02.on('sync', callbackFn_Sync);
                    pvp_02.on('turn-message', () => done(new Error('WTF 14')));
                    pvp_02.on('paused', () => done(new Error('WTF 15')));
                    pvp_02.on('unpaused', (theMessage, ts1, ts2) => {
                        unpauseArguments2 = [theMessage, ts1, ts2];
                        callbackFn_Unpaused();
                    });

                    connect = true;
                    callbackFn();
                };
                let callbackFn_Unpaused = () => {
                    if(unpauseArguments1 && unpauseArguments2){
                        expect(unpauseArguments1[0]).to.be.equal('GR: opponent connected');
                        expect(unpauseArguments1[1]).to.be.above(0);
                        expect(unpauseArguments1[2]).to.be.above(0);

                        expect(unpauseArguments2[0]).to.be.a('null');
                        expect(unpauseArguments2[1]).to.be.above(0);
                        expect(unpauseArguments2[2]).to.be.above(0);

                        unpaused = true;
                        callbackFn();
                    }
                };
                let callbackFn_Begin = msg => {
                    expect(msg).to.be.a('undefined');

                    theBegin = true;
                    callbackFn();
                };
                let callbackFn_Sync = msg => {
                    expect(msg).to.have.property('isA');
                    expect(msg).to.have.property('playerTurnA');
                    expect(msg).to.have.property('playerTurnB');
                    expect(msg).to.have.property('mdl');
                    expect(msg.mdl).to.have.property('model');
                    expect(msg.mdl).to.have.property('randomSeed');
                    expect(msg.mdl).to.have.property('startTs');

                    theSync = true;
                    callbackFn();
                };
                let callbackFn = () => {
                    if(connect && unpaused && theBegin && theSync){
                        pvp_01.removeAllListeners('progress');
                        pvp_01.removeAllListeners('begin');
                        pvp_01.removeAllListeners('error');
                        pvp_01.removeAllListeners('direct-message');
                        pvp_01.removeAllListeners('finish');
                        pvp_01.removeAllListeners('model');
                        pvp_01.removeAllListeners('sync');
                        pvp_01.removeAllListeners('turn-message');
                        pvp_01.removeAllListeners('paused');
                        pvp_01.removeAllListeners('unpaused');

                        pvp_02.removeAllListeners('progress');
                        pvp_02.removeAllListeners('begin');
                        pvp_02.removeAllListeners('error');
                        pvp_02.removeAllListeners('direct-message');
                        pvp_02.removeAllListeners('finish');
                        pvp_02.removeAllListeners('model');
                        pvp_02.removeAllListeners('sync');
                        pvp_02.removeAllListeners('turn-message');
                        pvp_02.removeAllListeners('paused');
                        pvp_02.removeAllListeners('unpaused');

                        done();
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', () => done(new Error('WTF 5')));
                pvp_01.on('sync', () => done(new Error('WTF 6')));
                pvp_01.on('turn-message', () => done(new Error('WTF 7')));
                pvp_01.on('paused', () => done(new Error('WTF 8')));
                pvp_01.on('unpaused', (theMessage, ts1, ts2) => {
                    unpauseArguments1 = [theMessage, ts1, ts2];
                    callbackFn_Unpaused();
                });

                gbaseApiStdl_02.pvp.beginOnAddressAndKey(pvpRoomData, callbackFn_Connect);
            });
            it(`First player should finalize pvp by sending ${HOW_MUCH_TURNS}th turn`, done => {
                let firstIsDone = false, secondIsDone = false;

                let callbackFn_Finish = (i, msg) => {
                    expect(msg.ok).to.be.equal(true);
                    expect(msg.details.endMessage).to.have.property('gameIsOver', true);
                    expect(msg.details.endMessage).to.have.property('finalm');
                    expect(msg.details.endMessage.finalm).to.have.property('m');
                    try{
                        expect(msg.details.endMessage.finalm).to.have.property('asq', HOW_MUCH_TURNS);
                    } catch(__){
                        expect(msg.details.endMessage.finalm).to.have.property('bsq', HOW_MUCH_TURNS);
                    }
                    try{
                        expect(msg.details.endMessage.finalm).to.have.property('bsq', HOW_MUCH_TURNS - 1);
                    } catch(__){
                        expect(msg.details.endMessage.finalm).to.have.property('asq', HOW_MUCH_TURNS - 1);
                    }
                    expect(msg.details.endMessage.finalm.m).to.deep.equal({ message: 'FIN!' });

                    if(i === 0){
                        if(!firstIsDone){
                            firstIsDone = true;
                        } else {
                            return done(new Error('WTF 17'));
                        }
                    } else if(i === 1){
                        if(!secondIsDone){
                            secondIsDone = true;
                        } else {
                            return done(new Error('WTF 18'));
                        }
                    }
                    if(firstIsDone && secondIsDone){
                        pvp_01.removeAllListeners('progress');
                        pvp_01.removeAllListeners('begin');
                        pvp_01.removeAllListeners('error');
                        pvp_01.removeAllListeners('direct-message');
                        pvp_01.removeAllListeners('finish');
                        pvp_01.removeAllListeners('model');
                        pvp_01.removeAllListeners('sync');
                        pvp_01.removeAllListeners('turn-message');
                        pvp_01.removeAllListeners('paused');
                        pvp_01.removeAllListeners('unpaused');

                        pvp_02.removeAllListeners('progress');
                        pvp_02.removeAllListeners('begin');
                        pvp_02.removeAllListeners('error');
                        pvp_02.removeAllListeners('direct-message');
                        pvp_02.removeAllListeners('finish');
                        pvp_02.removeAllListeners('model');
                        pvp_02.removeAllListeners('sync');
                        pvp_02.removeAllListeners('turn-message');
                        pvp_02.removeAllListeners('paused');
                        pvp_02.removeAllListeners('unpaused');

                        done();
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', msg => callbackFn_Finish(0, msg));
                pvp_01.on('model', () => done(new Error('WTF 4')));
                pvp_01.on('sync', () => done(new Error('WTF 5')));
                pvp_01.on('turn-message', () => done(new Error('WTF 6')));
                pvp_01.on('paused', () => done(new Error('WTF 7')));
                pvp_01.on('unpaused', () => done(new Error('WTF 8')));

                pvp_02.on('progress', () => done(new Error('WTF 9')));
                pvp_02.on('begin', () => done(new Error('WTF 10')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 11')));
                pvp_02.on('finish', msg => callbackFn_Finish(1, msg));
                pvp_02.on('model', () => done(new Error('WTF 12')));
                pvp_02.on('sync', () => done(new Error('WTF 13')));
                pvp_02.on('turn-message', () => done(new Error('WTF 14')));
                pvp_02.on('paused', () => done(new Error('WTF 15')));
                pvp_02.on('unpaused', () => done(new Error('WTF 16')));

                pvp_01.sendTurn('FIN!');
            });
        });
        describe('Pause and auto-gameover during gameplay', () => {
            it('First should call dropMatchmaking', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse).to.have.property('forReal');

                    done();
                };

                gbaseApiStdl_01.pvp.dropMatchmaking(callbackFn);
            });
            it('Second should call dropMatchmaking', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse).to.have.property('forReal');

                    done();
                };

                gbaseApiStdl_02.pvp.dropMatchmaking(callbackFn);
            });
            it('The first should pull checkBattleNoSearch', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: neither in queue nor in battle');

                    done();
                };

                gbaseApiStdl_01.pvp.checkBattleNoSearch(callbackFn);
            });
            it('The second should pull checkBattleNoSearch', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: neither in queue nor in battle');

                    done();
                };

                gbaseApiStdl_02.pvp.checkBattleNoSearch(callbackFn);
            });

            var pvp_01, pvp_02;

            it('Both should find each other in pvp matchmaking', done => {
                let callbackFn_final = () => {
                    if(pvp_01 && pvp_02){
                        done();
                    }
                };

                let callbackFn_01 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                    pvp_01 = response.details.pvp;

                    callbackFn_final();
                };
                let callbackFn_02 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                    pvp_02 = response.details.pvp;

                    callbackFn_final();
                };

                gbaseApiStdl_01.pvp.withOpponent(
                    FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_01
                );
                gbaseApiStdl_02.pvp.withOpponent(
                    FROM_SEGMENT, GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_02
                );
            });
            it('Both should receive progress messages', done => {
                var begin_01 = false, begin_02 = false,
                    shouldBeModel_01 = false, shouldBeModel_02 = false,
                    beenModel_01 = false, beenModel_02 = false;

                let callbackFn_Progress = (i, msg) => {
                    expect(EXPECTED_PROGRESS).to.include(msg);
                };
                let callbackFn_Begin = (i, msg) => {
                    if(msg){
                        expect(msg).to.be.equal(EXPECTED_BEGIN_MESSAGE);
                    } else if(i === 0){
                        shouldBeModel_01 = true;
                    } else {
                        shouldBeModel_02 = true;
                    }
                    if(i === 0){
                        expect(pvp_01).to.have.property('myPing');
                        expect(pvp_01).to.have.property('opponentPing');
                        expect(pvp_01).to.have.property('isPaused', false);
                        try{
                            expect(pvp_01.opponentPayload).to.deep.equal({ some: 'payload b' });
                        } catch(__){
                            expect(pvp_01.opponentPayload).to.deep.equal({ some: 'payload a' });
                        }
                        expect(pvp_01).to.have.property('startTimestamp');
                        expect(pvp_01).to.have.property('randomSeed');
                        expect(pvp_01).to.have.property('meIsPlayerA');
                        begin_01 = true;
                        return callbackFn();
                    } else if(i === 1){
                        expect(pvp_02).to.have.property('myPing');
                        expect(pvp_02).to.have.property('opponentPing');
                        expect(pvp_02).to.have.property('isPaused', false);
                        try{
                            expect(pvp_02.opponentPayload).to.deep.equal({ some: 'payload a' });
                        } catch(__){
                            expect(pvp_02.opponentPayload).to.deep.equal({ some: 'payload b' });
                        }
                        expect(pvp_02).to.have.property('startTimestamp');
                        expect(pvp_02).to.have.property('randomSeed');
                        expect(pvp_02).to.have.property('meIsPlayerA');
                        begin_02 = true;
                        return callbackFn();
                    }
                    done(new Error('WTF 16'));
                };
                let callbackFn_Model = (i, msg) => {
                    expect(msg).to.have.property('isA');
                    expect(msg).to.have.property('mdl');
                    expect(msg).to.have.property('playerTurnA', 0);
                    expect(msg).to.have.property('playerTurnB', 0);
                    expect(msg.mdl).to.have.property('model');
                    expect(msg.mdl).to.have.property('randomSeed');
                    expect(msg.mdl).to.have.property('startTs');
                    if(i === 0){
                        expect(shouldBeModel_01).to.be.equal(true);
                        expect(beenModel_01).to.be.equal(false);
                        beenModel_01 = true;
                    } else {
                        expect(shouldBeModel_02).to.be.equal(true);
                        expect(beenModel_02).to.be.equal(false);
                        beenModel_02 = true;
                    }
                    callbackFn();
                };
                let callbackFn = () => {
                    if(begin_01 && begin_02 && (((shouldBeModel_01 && beenModel_01) || (!shouldBeModel_01))) && ((shouldBeModel_02 && beenModel_02) || (!shouldBeModel_02))){
                        pvp_01.removeAllListeners('progress');
                        pvp_01.removeAllListeners('begin');
                        pvp_01.removeAllListeners('error');
                        pvp_01.removeAllListeners('direct-message');
                        pvp_01.removeAllListeners('finish');
                        pvp_01.removeAllListeners('model');
                        pvp_01.removeAllListeners('sync');
                        pvp_01.removeAllListeners('turn-message');
                        pvp_01.removeAllListeners('paused');
                        pvp_01.removeAllListeners('unpaused');

                        pvp_02.removeAllListeners('progress');
                        pvp_02.removeAllListeners('begin');
                        pvp_02.removeAllListeners('error');
                        pvp_02.removeAllListeners('direct-message');
                        pvp_02.removeAllListeners('finish');
                        pvp_02.removeAllListeners('model');
                        pvp_02.removeAllListeners('sync');
                        pvp_02.removeAllListeners('turn-message');
                        pvp_02.removeAllListeners('paused');
                        pvp_02.removeAllListeners('unpaused');

                        done();
                    }
                };

                pvp_01.on('progress', msg => callbackFn_Progress(0, msg));
                pvp_01.on('begin', msg => callbackFn_Begin(0, msg));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 1')));
                pvp_01.on('finish', () => done(new Error('WTF 2')));
                pvp_01.on('model', msg => callbackFn_Model(0, msg));
                pvp_01.on('sync', () => done(new Error('WTF 4')));
                pvp_01.on('turn-message', () => done(new Error('WTF 5')));
                pvp_01.on('paused', () => done(new Error('WTF 6')));
                pvp_01.on('unpaused', () => done(new Error('WTF 7')));

                pvp_02.on('progress', msg => callbackFn_Progress(1, msg));
                pvp_02.on('begin', msg => callbackFn_Begin(1, msg));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 8')));
                pvp_02.on('finish', () => done(new Error('WTF 9')));
                pvp_02.on('model', msg => callbackFn_Model(1, msg));
                pvp_02.on('sync', () => done(new Error('WTF 11')));
                pvp_02.on('turn-message', () => done(new Error('WTF 12')));
                pvp_02.on('paused', () => done(new Error('WTF 13')));
                pvp_02.on('unpaused', () => done(new Error('WTF 14')));

                pvp_01.doConnect({ payload: '01' });
                pvp_02.doConnect({ payload: '02' });
            });
            it('First player should force disconnect and the second should see the pause', done => {
                var pauseArguments1, pauseArguments2;

                let callbackFn = () => {
                    if(pauseArguments1 && pauseArguments2){
                        expect(pauseArguments1[0]).to.be.equal('Game paused due to disconnection');
                        expect(pauseArguments1[1]).to.be.an('undefined');

                        expect(pauseArguments2[0]).to.have.property('isA');
                        expect(pauseArguments2[0]).to.have.property('playerTurnA');
                        expect(pauseArguments2[0]).to.have.property('playerTurnB');
                        expect(pauseArguments2[0]).to.have.property('theModel');
                        expect(pauseArguments2[1]).to.be.above(0);

                        setTimeout(() => {
                            pvp_01.removeAllListeners('progress');
                            pvp_01.removeAllListeners('begin');
                            pvp_01.removeAllListeners('error');
                            pvp_01.removeAllListeners('direct-message');
                            pvp_01.removeAllListeners('finish');
                            pvp_01.removeAllListeners('model');
                            pvp_01.removeAllListeners('sync');
                            pvp_01.removeAllListeners('turn-message');
                            pvp_01.removeAllListeners('paused');
                            pvp_01.removeAllListeners('unpaused');

                            pvp_02.removeAllListeners('progress');
                            pvp_02.removeAllListeners('begin');
                            pvp_02.removeAllListeners('error');
                            pvp_02.removeAllListeners('direct-message');
                            pvp_02.removeAllListeners('finish');
                            pvp_02.removeAllListeners('model');
                            pvp_02.removeAllListeners('sync');
                            pvp_02.removeAllListeners('turn-message');
                            pvp_02.removeAllListeners('paused');
                            pvp_02.removeAllListeners('unpaused');

                            done();
                        }, 1000);
                    }
                };

                pvp_01.on('progress', () => done(new Error('WTF 1')));
                pvp_01.on('begin', () => done(new Error('WTF 2')));
                pvp_01.on('error', err => done(err));
                pvp_01.on('direct-message', () => done(new Error('WTF 3')));
                pvp_01.on('finish', () => done(new Error('WTF 4')));
                pvp_01.on('model', () => done(new Error('WTF 5')));
                pvp_01.on('sync', () => done(new Error('WTF 6')));
                pvp_01.on('turn-message', () => done(new Error('WTF 7')));
                pvp_01.on('paused', (theMessage, fromTs) => {
                    pauseArguments1 = [theMessage, fromTs];
                    callbackFn();
                });
                pvp_01.on('unpaused', () => done(new Error('WTF 9')));

                pvp_02.on('progress', () => done(new Error('WTF 10')));
                pvp_02.on('begin', () => done(new Error('WTF 11')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 12')));
                pvp_02.on('finish', () => done(new Error('WTF 13')));
                pvp_02.on('model', () => done(new Error('WTF 14')));
                pvp_02.on('sync', () => done(new Error('WTF 15')));
                pvp_02.on('turn-message', () => done(new Error('WTF 16')));
                pvp_02.on('paused', (theMessage, fromTs) => {
                    pauseArguments2 = [theMessage, fromTs];
                    callbackFn();
                });
                pvp_02.on('unpaused', () => done(new Error('WTF 17')));

                pvp_01.forceDisconnect();
            });
            it('Second should see the automatic finish', done => {
                let callbackFn = response => {
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    try{
                        expect(response.details.endMessage).to.be.equal('GR: auto gameover');
                    } catch(__){
                        try{
                            expect(response.details.endMessage).to.be.equal('GR: pair dead or ttl is out');
                        } catch(__){
                            expect(response.details.endMessage).to.be.equal('Pair was not found. It\'s done or ttl is out');
                        }
                    }

                    pvp_02.removeAllListeners('progress');
                    pvp_02.removeAllListeners('begin');
                    pvp_02.removeAllListeners('error');
                    pvp_02.removeAllListeners('direct-message');
                    pvp_02.removeAllListeners('finish');
                    pvp_02.removeAllListeners('sync');
                    pvp_02.removeAllListeners('turn-message');
                    pvp_02.removeAllListeners('paused');
                    pvp_02.removeAllListeners('unpaused');

                    setTimeout(done, 1000);
                };

                pvp_02.on('progress', () => done(new Error('WTF 1')));
                pvp_02.on('begin', () => done(new Error('WTF 2')));
                pvp_02.on('error', err => done(err));
                pvp_02.on('direct-message', () => done(new Error('WTF 3')));
                pvp_02.on('finish', callbackFn);
                pvp_02.on('sync', () => done(new Error('WTF 5')));
                pvp_02.on('turn-message', () => done(new Error('WTF 6')));
                pvp_02.on('paused', () => done(new Error('WTF 7')));
                pvp_02.on('unpaused', () => done(new Error('WTF 8')));
            });
            it('First should destroy local pvp', () => {
                pvp_01.forceDestroyClient();
            });
            it('First player should list battle journal and see entry with auto=true', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.l.length).to.be.equal(3);
                    expect(response.details.originalResponse.l[0].auto).to.be.equal(true);

                    done();
                };

                // We get a finish event independently of battle journal entry, so we give some penalty time to persist
                setTimeout(() => gbaseApiStdl_01.pvp.battlesList(0, 20, false, callbackFn), 1000);
            });
            it('Second player should list battle journal and see entry with auto=true', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    expect(response.details.originalResponse.l.length).to.be.equal(3);
                    expect(response.details.originalResponse.l[0].auto).to.be.equal(true);

                    done();
                };

                // We get a finish event independently of battle journal entry, so we give some penalty time to persist
                setTimeout(() => gbaseApiStdl_02.pvp.battlesList(0, 20, false, callbackFn), 1000);
            });
        });
    });
    describe('Player versus self', () => {
        it('First should call dropMatchmaking', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse).to.have.property('forReal');

                done();
            };

            gbaseApiStdl_01.pvp.dropMatchmaking(callbackFn);
        });

        var thePvp, pvpRoomData;

        it('First player should begin game versus self', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details).to.have.property('pvp');

                thePvp = response.details.pvp;

                done();
            };

            gbaseApiStdl_01.pvp.beginVersusSelf(2, callbackFn);
        });
        it('First should receive progress messages', done => {
            var begin = false, shouldBeModel = false, beenModel = false;

            let callbackFn_Progress = msg => {
                expect(EXPECTED_PROGRESS).to.include(msg);
            };
            let callbackFn_Begin = msg => {
                if(msg){
                    expect(msg).to.be.equal(EXPECTED_BEGIN_MESSAGE);
                } else {
                    shouldBeModel = true;
                }
                expect(thePvp).to.have.property('myPing');
                expect(thePvp).to.have.property('opponentPing');
                expect(thePvp).to.have.property('isPaused', false);
                expect(thePvp.opponentPayload).to.deep.equal({ some: 'payload b', alsoBot: true });
                expect(thePvp).to.have.property('startTimestamp');
                expect(thePvp).to.have.property('randomSeed');
                expect(thePvp).to.have.property('meIsPlayerA');

                begin = true;
                callbackFn();
            };
            let callbackFn_Model = msg => {
                expect(msg).to.have.property('isA');
                expect(msg).to.have.property('mdl');
                expect(msg).to.have.property('playerTurnA', 0);
                expect(msg).to.have.property('playerTurnB', 0);
                expect(msg.mdl).to.have.property('model');
                expect(msg.mdl).to.have.property('randomSeed');
                expect(msg.mdl).to.have.property('startTs');
                expect(shouldBeModel).to.be.equal(true);
                expect(beenModel).to.be.equal(false);
                beenModel = true;
                callbackFn();
            };
            let callbackFn = () => {
                if(begin && ((shouldBeModel && beenModel) || !shouldBeModel)){
                    thePvp.removeAllListeners('progress');
                    thePvp.removeAllListeners('begin');
                    thePvp.removeAllListeners('error');
                    thePvp.removeAllListeners('direct-message');
                    thePvp.removeAllListeners('finish');
                    thePvp.removeAllListeners('model');
                    thePvp.removeAllListeners('sync');
                    thePvp.removeAllListeners('turn-message');
                    thePvp.removeAllListeners('paused');
                    thePvp.removeAllListeners('unpaused');

                    done();
                }
            };

            thePvp.on('progress', callbackFn_Progress);
            thePvp.on('begin', callbackFn_Begin);
            thePvp.on('error', err => done(err));
            thePvp.on('direct-message', () => done(new Error('WTF 1')));
            thePvp.on('finish', () => done(new Error('WTF 2')));
            thePvp.on('model', callbackFn_Model);
            thePvp.on('sync', () => done(new Error('WTF 4')));
            thePvp.on('turn-message', () => done(new Error('WTF 5')));
            thePvp.on('paused', () => done(new Error('WTF 6')));
            thePvp.on('unpaused', () => done(new Error('WTF 7')));

            thePvp.doConnect({ payload: '01' });
        });
        it(`First player should send ${HOW_MUCH_DIRECT} direct messages and get all of them`, done => {
            var theMessagesCounter = 0;

            let callbackFn_Message = msg => {
                msg = msg.message;
                if(theMessagesCounter === msg && msg < HOW_MUCH_DIRECT){
                    if(++theMessagesCounter === HOW_MUCH_DIRECT){
                        thePvp.removeAllListeners('progress');
                        thePvp.removeAllListeners('begin');
                        thePvp.removeAllListeners('error');
                        thePvp.removeAllListeners('direct-message');
                        thePvp.removeAllListeners('finish');
                        thePvp.removeAllListeners('model');
                        thePvp.removeAllListeners('sync');
                        thePvp.removeAllListeners('turn-message');
                        thePvp.removeAllListeners('paused');
                        thePvp.removeAllListeners('unpaused');

                        done();
                    }
                } else {
                    done(new Error('WTF 9'));
                }
            };

            thePvp.on('progress', () => done(new Error('WTF 1')));
            thePvp.on('begin', () => done(new Error('WTF 2')));
            thePvp.on('error', err => done(err));
            thePvp.on('direct-message', callbackFn_Message);
            thePvp.on('finish', () => done(new Error('WTF 3')));
            thePvp.on('model', () => done(new Error('WTF 4')));
            thePvp.on('sync', () => done(new Error('WTF 5')));
            thePvp.on('turn-message', () => done(new Error('WTF 6')));
            thePvp.on('paused', () => done(new Error('WTF 7')));
            thePvp.on('unpaused', () => done(new Error('WTF 8')));

            for(let i = 0 ; i < HOW_MUCH_DIRECT ; i++){
                thePvp.sendDirect(i);
            }
        });
        it(`The first should send ${HOW_MUCH_TURNS - 1} turn messages and get them all`, done => {
            var theMessagesCounter = 0;

            let callbackFn_Message = msg => {
                msg = msg.m.message;
                if(theMessagesCounter === msg && msg < HOW_MUCH_TURNS - 1){
                    if(++theMessagesCounter === HOW_MUCH_TURNS - 1){
                        thePvp.removeAllListeners('progress');
                        thePvp.removeAllListeners('begin');
                        thePvp.removeAllListeners('error');
                        thePvp.removeAllListeners('direct-message');
                        thePvp.removeAllListeners('finish');
                        thePvp.removeAllListeners('model');
                        thePvp.removeAllListeners('sync');
                        thePvp.removeAllListeners('turn-message');
                        thePvp.removeAllListeners('paused');
                        thePvp.removeAllListeners('unpaused');

                        done();
                    }
                } else {
                    done(new Error('WTF 9'));
                }
            };

            thePvp.on('progress', () => done(new Error('WTF 1')));
            thePvp.on('begin', () => done(new Error('WTF 2')));
            thePvp.on('error', err => done(err));
            thePvp.on('direct-message', () => done(new Error('WTF 3')));
            thePvp.on('finish', () => done(new Error('WTF 4')));
            thePvp.on('model', () => done(new Error('WTF 5')));
            thePvp.on('sync', () => done(new Error('WTF 6')));
            thePvp.on('turn-message', callbackFn_Message);
            thePvp.on('paused', () => done(new Error('WTF 7')));
            thePvp.on('unpaused', () => done(new Error('WTF 8')));

            for(let i = 0 ; i < HOW_MUCH_TURNS - 1 ; i++){
                thePvp.sendTurn(i);
            }
        });
        it('First player should disconnect', () => {
            thePvp.removeAllListeners('progress');
            thePvp.removeAllListeners('begin');
            thePvp.removeAllListeners('error');
            thePvp.removeAllListeners('direct-message');
            thePvp.removeAllListeners('finish');
            thePvp.removeAllListeners('model');
            thePvp.removeAllListeners('sync');
            thePvp.removeAllListeners('turn-message');
            thePvp.removeAllListeners('paused');
            thePvp.removeAllListeners('unpaused');

            thePvp.forceDestroyClient();
        });
        it('First should pull checkBattleNoSearch', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details.originalResponse.stat).to.be.equal('MM: gameroom allocated');

                pvpRoomData = response.details.originalResponse;

                done();
            };

            gbaseApiStdl_01.pvp.checkBattleNoSearch(callbackFn);
        });
        it('First should reconnect', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                expect(response.details).to.have.property('pvp');

                thePvp = response.details.pvp;

                done();
            };

            gbaseApiStdl_01.pvp.beginOnAddressAndKey(pvpRoomData, callbackFn);
        });
        it('First should get "sync" event', done => {
            var theBegin = false, theSync = false;

            let callbackFn_Begin = msg => {
                expect(msg).to.be.a('undefined');

                theBegin = true;
                callbackFn();
            };
            let callbackFn_Sync = msg => {
                expect(msg).to.have.property('isA');
                expect(msg).to.have.property('playerTurnA');
                expect(msg).to.have.property('playerTurnB');
                expect(msg).to.have.property('mdl');
                expect(msg.mdl).to.have.property('model');
                expect(msg.mdl).to.have.property('randomSeed');
                expect(msg.mdl).to.have.property('startTs');

                theSync = true;
                callbackFn();
            };
            let callbackFn = () => {
                if(theBegin && theSync){
                    thePvp.removeAllListeners('progress');
                    thePvp.removeAllListeners('begin');
                    thePvp.removeAllListeners('error');
                    thePvp.removeAllListeners('direct-message');
                    thePvp.removeAllListeners('finish');
                    thePvp.removeAllListeners('model');
                    thePvp.removeAllListeners('sync');
                    thePvp.removeAllListeners('turn-message');
                    thePvp.removeAllListeners('paused');
                    thePvp.removeAllListeners('unpaused');

                    done();
                }
            };

            thePvp.on('progress', () => done(new Error('WTF 1')));
            thePvp.on('begin', callbackFn_Begin);
            thePvp.on('error', err => done(err));
            thePvp.on('direct-message', () => done(new Error('WTF 3')));
            thePvp.on('finish', () => done(new Error('WTF 4')));
            thePvp.on('model', () => done(new Error('WTF 5')));
            thePvp.on('sync', callbackFn_Sync);
            thePvp.on('turn-message', () => done(new Error('WTF 6')));
            thePvp.on('paused', () => done(new Error('WTF 7')));
            thePvp.on('unpaused', () => done(new Error('WTF 8')));
        });
        it(`First player should finalize pvp by sending ${HOW_MUCH_TURNS}th turn`, done => {
            let callbackFn_Finish = msg => {
                expect(msg.ok).to.be.equal(true);
                expect(msg.details.endMessage).to.have.property('gameIsOver', true);
                expect(msg.details.endMessage).to.have.property('finalm');
                expect(msg.details.endMessage.finalm).to.have.property('m');
                expect(msg.details.endMessage.finalm).to.have.property('asq', HOW_MUCH_TURNS);
                expect(msg.details.endMessage.finalm).to.have.property('bsq', 0);
                expect(msg.details.endMessage.finalm.m).to.deep.equal({ message: 'FIN!' });

                thePvp.removeAllListeners('progress');
                thePvp.removeAllListeners('begin');
                thePvp.removeAllListeners('error');
                thePvp.removeAllListeners('direct-message');
                thePvp.removeAllListeners('finish');
                thePvp.removeAllListeners('model');
                thePvp.removeAllListeners('sync');
                thePvp.removeAllListeners('turn-message');
                thePvp.removeAllListeners('paused');
                thePvp.removeAllListeners('unpaused');

                done();
            };

            thePvp.on('progress', () => done(new Error('WTF 1')));
            thePvp.on('begin', () => done(new Error('WTF 2')));
            thePvp.on('error', err => done(err));
            thePvp.on('direct-message', () => done(new Error('WTF 3')));
            thePvp.on('finish', callbackFn_Finish);
            thePvp.on('model', () => done(new Error('WTF 4')));
            thePvp.on('sync', () => done(new Error('WTF 5')));
            thePvp.on('turn-message', () => done(new Error('WTF 6')));
            thePvp.on('paused', () => done(new Error('WTF 7')));
            thePvp.on('unpaused', () => done(new Error('WTF 8')));

            thePvp.sendTurn('FIN!');
        });
    });
    for(let i = 0 ; i < 30 ; i++){
        describe(`WTF! #${i + 1}`, () => {
            var pvpPlayer_01, pvpPlayer_02;

            it('Should done step 1', () => {
                pvpPlayer_01 = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
                pvpPlayer_02 = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
            });
            it('Should done step 2.1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                pvpPlayer_01.account.signupGbaseAnon(callbackFn);
            });
            it('Should done step 2.2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                pvpPlayer_02.account.signupGbaseAnon(callbackFn);
            });
            it('Should done step 3.1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                pvpPlayer_01.profile.create(callbackFn);
            });
            it('Should done step 3.2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                pvpPlayer_02.profile.create(callbackFn);
            });
            it('Should done step 4.1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                pvpPlayer_01.leaderboards.postRecord(12345, FROM_SEGMENT, callbackFn);
            });
            it('Should done step 4.2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                pvpPlayer_02.leaderboards.postRecord(12345, FROM_SEGMENT, callbackFn);
            });

            var pvp_01, pvp_02;

            it('Should done step 5', done => {
                let callbackFn_01 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    pvp_01 = response.details.pvp;

                    callbackFn_Final();
                };
                let callbackFn_02 = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);
                    pvp_02 = response.details.pvp;

                    callbackFn_Final();
                };
                let callbackFn_Final = () => {
                    if(pvp_01 && pvp_02){
                        done();
                    }
                };

                pvpPlayer_01.pvp.withOpponent(
                    'segma', GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_01
                );
                pvpPlayer_02.pvp.withOpponent(
                    'segma', GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING,
                    new GbaseRangePicker('any').range(GbaseRangePicker.NEGATIVE_INFINITY, GbaseRangePicker.POSITIVE_INFINITY),
                    60, callbackFn_02
                );
            });
            it('Should done step 6', done => {
                var begin_01 = false, begin_02 = false;

                let callbackFn_Begin = i => {
                    if(i === 0){
                        begin_01 = true;
                        callbackFn();
                    } else if(i === 1){
                        begin_02 = true;
                        callbackFn();
                    }
                };
                let callbackFn = () => {
                    if(begin_01 && begin_02){
                        pvp_01.removeAllListeners('begin');
                        pvp_01.removeAllListeners('error');
                        pvp_02.removeAllListeners('begin');
                        pvp_02.removeAllListeners('error');
                        done();
                    }
                };

                pvp_01.on('begin', msg => callbackFn_Begin(0, msg));
                pvp_01.on('error', err => console.error(err));

                pvp_02.on('begin', msg => callbackFn_Begin(1, msg));
                pvp_02.on('error', err => console.error(err));

                pvp_01.doConnect({ payload: '01' });
                pvp_02.doConnect({ payload: '02' });
            });
            it('Should done step 7.1', done => {
                var theMessagesCounter = 0;

                let callbackFn_Message = msg => {
                    msg = msg.m.message;
                    if(theMessagesCounter === msg && msg < 14){
                        if(++theMessagesCounter === 14){
                            pvp_02.removeAllListeners('turn-message');
                            done();
                        }
                    }
                };

                pvp_02.on('turn-message', callbackFn_Message);

                for(let i = 0 ; i < 14 ; i++){
                    pvp_01.sendTurn(i);
                }
            });
            it('Should done step 7.2', done => {
                var theMessagesCounter = 0;

                let callbackFn_Message = msg => {
                    msg = msg.m.message;
                    if(theMessagesCounter === msg && msg < 14){
                        if(++theMessagesCounter === 14){
                            pvp_01.removeAllListeners('turn-message');
                            done();
                        }
                    }
                };

                pvp_01.on('turn-message', callbackFn_Message);

                for(let i = 0 ; i < 14 ; i++){
                    pvp_02.sendTurn(i);
                }
            });
            it('Should done step 8', done => {
                let firstIsDone = false, secondIsDone = false;

                let callbackFn_Finish = i => {
                    if(i === 0){
                        firstIsDone = true;
                    } else if(i === 1){
                        secondIsDone = true;
                    }
                    if(firstIsDone && secondIsDone){
                        pvp_01.removeAllListeners('error');
                        pvp_01.removeAllListeners('finish');
                        pvp_02.removeAllListeners('error');
                        pvp_02.removeAllListeners('finish');
                        done();
                    }
                };

                pvp_01.on('finish', msg => callbackFn_Finish(0, msg));
                pvp_01.on('error', err => console.error(err));

                pvp_02.on('finish', msg => callbackFn_Finish(1, msg));
                pvp_02.on('error', err => console.error(err));

                pvp_01.sendTurn('FIN!');
            });
            it('Should done step 9.1', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                pvpPlayer_01.leaderboards.removeSelfRecord(FROM_SEGMENT, callbackFn);
            });
            it('Should done step 9.2', done => {
                let callbackFn = (err, response) => {
                    expect(err).to.be.a('null');
                    expect(response).to.be.an.instanceof(GbaseResponse);

                    expect(response.ok).to.be.equal(true);

                    done();
                };

                pvpPlayer_02.leaderboards.removeSelfRecord(FROM_SEGMENT, callbackFn);
            });
        });
    }
    describe('Stuff', () => {
        it('Should remove record #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_01.leaderboards.removeSelfRecord(FROM_SEGMENT, callbackFn);
        });
        it('Should remove record #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            gbaseApiStdl_02.leaderboards.removeSelfRecord(FROM_SEGMENT, callbackFn);
        });
    });
});