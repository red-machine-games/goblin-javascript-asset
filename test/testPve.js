'use strict';

var expect = require('chai').expect;

const LOCAL_ADDRESS = 'http://localhost:1337',
    HMAC_SECRET = 'default';

var GbaseApi = require('../lib/GbaseApi.js').GbaseApi,
    GbaseResponse = require('../lib/objects/GbaseResponse.js');

/**
 * To run this test case you need to have 3 custom functions on Goblin backend: pveInit, pveAct and pveFinalize:
 *
 * pveInit:
 * ```
 * var turnsToFinish = 15,
 *     theModel = { turnsToFinish, currentTurn: 0 };
 *
 * PveInitResponse(theModel, { turnsToFinish });
 * ```
 *
 * pveAct:
 * ```
 * if(++args.battleModel.currentTurn === args.battleModel.turnsToFinish){
 *     return PveActResponse(true, null, { over: true });
 * } else {
 *     return PveActResponse(false, args.battleModel, { okay: true, turn: args.battleModel.currentTurn });
 * }
 * ```
 *
 * pveFinalize:
 * ```
 * appendSelfBattleJournalPve({ iAmThe: 'law' });
 *
 * PveFinalizeResponse();
 * ```
 *
 */

describe('testPve.js', () => {
    var gbaseApiStdl;

    const LETS_IMAGINE_THAT_WE_NEED_THIS_NUM_OF_TURNS = 15;

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
    it('Should begin pve', done => {
        let callbackFn = (err, response) => {
            expect(err).to.be.a('null');
            expect(response).to.be.an.instanceof(GbaseResponse);

            expect(response.ok).to.be.equal(true);
            expect(response.details.originalResponse).to.deep.equal({ turnsToFinish: LETS_IMAGINE_THAT_WE_NEED_THIS_NUM_OF_TURNS });

            done();
        };

        gbaseApiStdl.pve.begin({ some: { begin: 'params' } }, callbackFn);
    });
    for(let i = 0 ; i < LETS_IMAGINE_THAT_WE_NEED_THIS_NUM_OF_TURNS ; i++){
        it(`Should do pveAct #${i + 1}`, done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);
                if(i === LETS_IMAGINE_THAT_WE_NEED_THIS_NUM_OF_TURNS - 1){
                    expect(response.details.originalResponse).to.deep.equal({ over: true });
                } else {
                    expect(response.details.originalResponse).to.deep.equal({ okay: true, turn: i + 1 });
                }

                done();
            };

            gbaseApiStdl.pve.act({ some: 'param' }, callbackFn);
        });
    }
    it('Should see the battle journal entry', done => {
        let callbackFn = (err, response) => {
            expect(err).to.be.a('null');
            expect(response).to.be.an.instanceof(GbaseResponse);

            expect(response.ok).to.be.equal(true);
            expect(response.details.originalResponse.l.length).to.be.equal(1);

            done();
        };

        gbaseApiStdl.pve.listBattles(0, 20, callbackFn);
    });
});