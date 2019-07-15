'use strict';

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js'),
    GbaseRangePicker = require('../objects/GbaseRangePicker.js'),
    GbasePvp = require('./GbasePvp.js');

var GbaseConstants = require('../GbaseConstants.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP,
    DEFAULT_RECORDS_SEGMENT = GbaseConstants.DEFAULT_RECORDS_SEGMENT,
    MATCHMAKING_STRATEGIES_MAP = GbaseConstants.MATCHMAKING_STRATEGIES_MAP;

class GbasePvpApi {
    /**
     * A section of API holding everything needed to start PvP with real player or fictive opponent
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;

        this._currentlySearchingPvp = false;
        this._currentlySearchingPvpContinuing = true;
        this._currentPvp = null;

        this._deferredConnection = 0;
    }

    /**
     * Player's matchmaking and pvp state is exclusive hence player can't play a few pvps at once. If you faced client crash and restart
     * you should run this method to check whatever player was at pvp before crash. In response you'll get a status and pvp data if has.
     * Provide this pvp data into beginOnAddressAndKey method to continue pvp.
     *
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    checkBattleNoSearch(callback=NOOP){
        if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 140));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 141));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 142));
        }

        let callbackFn = (err, body) => {
            if(err){
                callback(err);
            } else if(body.c === 3){
                callback(null, new GbaseResponse(true, { pvp: new GbasePvp(this._gbaseApi, this, body.address, body.key, this._deferredConnection), originalResponse: body }));
            } else {
                callback(null, new GbaseResponse(true, { originalResponse: body }));
            }
        };

        this._gbaseApi._networkManager.doSendRequest(`${URIS['pvp.checkBattleNoSearch']}`, null, callbackFn);
    }

    /**
     * Useful service method to force clean all matchmaking data. You can call it every time after proper finishing yet another pvp.
     *
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    dropMatchmaking(callback=NOOP){
        if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 143));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 144));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 145));
        } else if(this._currentPvp){
            return callback(new GbaseError('Playing PvP currently', 146));
        }

        let callbackFn = (err, body) => {
            if(err){
                callback(err);
            } else {
                callback(null, new GbaseResponse(true, { originalResponse: body }));
            }
        };

        this._gbaseApi._networkManager.doSendRequest(`${URIS['pvp.dropMatchmaking']}`, null, callbackFn);
    }

    /**
     * Search and begin pvp 1 versus 1. The gameplay will be encapsulated into "response.pvp" value as {GbasePvp}
     *
     * @param fromSegment {String} - ratings segment to search among
     * @param strategy {String} - if backend is configured to receive client-defined strategy, you can pick one from two available: GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING and GbaseApi.MATCHMAKING_STRATEGIES.BY_LADDER
     * @param ranges {GbaseRangePicker} - an instance with ranges of search. See test examples
     * @param timeLimitSec {Number} - limit searching time in seconds. No guarantee that limit will be accurately equal to provided value because process is abrupt
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    withOpponent(fromSegment=DEFAULT_RECORDS_SEGMENT, strategy, ranges, timeLimitSec=60, callback=NOOP){
        if(this._currentlySearchingPvp){
            return callback(new GbaseError('Already searching now. Stop searching before continue', 147));
        } else if(this._currentPvp){
            return callback(new GbaseError('Already in pvp right now', 148));
        } else if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 149));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 150));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 151));
        } else if(!fromSegment || typeof fromSegment !== 'string'){
            return callback(new GbaseError('Argument fromSegment is invalid', 152));
        } else if(!Object.values(MATCHMAKING_STRATEGIES_MAP).includes(strategy)){
            return callback(new GbaseError('Argument strategy is invalid', 153));
        } else if(!ranges || !(ranges instanceof GbaseRangePicker) || !ranges.rgs.length){
            return callback(new GbaseError('Argument ranges is invalid', 154));
        }

        this._currentlySearchingPvp = true;
        this._currentlySearchingPvpContinuing = true;

        var leThis = this;

        if(typeof timeLimitSec === 'number' && !isNaN(timeLimitSec) && timeLimitSec > 0){
            var _to = setTimeout(() => this._currentlySearchingPvpContinuing = false, timeLimitSec * 1000);
        }

        function _aUniversalCallback(err, body){
            if(err){
                leThis._currentlySearchingPvp = false;
                if(err.details && (err.details.status === 404 || err.details.status === 503)){
                    callback(null, new GbaseResponse(false, { originalStatus: err.details.status, originalResponse: err }));
                } else {
                    callback(err);
                }
            } else {
                switch (body.c) {
                    case 0:
                        if (leThis._currentlySearchingPvpContinuing) {
                            doSearch();
                        } else {
                            doStopSearch();
                        }
                        break;
                    case 1:
                        doAcceptGame();
                        break;
                    case 2:
                        doWaitForOpponent();
                        break;
                    case 3:
                        doInitThePvp(body);
                        break;
                    default:
                        leThis._currentlySearchingPvp = false;
                        callback(null, new GbaseResponse(false, { originalResponse: body }));
                }
            }
        }
        function doSearch(){
            leThis._gbaseApi._networkManager.doSendRequest(`${URIS['pvp.searchForOpponent']}?segment=${fromSegment}&strat=${strategy}`, ranges, _aUniversalCallback);
        }
        function doStopSearch(){
            clearTimeout(_to);

            leThis._gbaseApi._networkManager.doSendRequest(`${URIS['pvp.stopSearchingForOpponent']}`, null, _aUniversalCallback);
        }
        function doAcceptGame(){
            clearTimeout(_to);

            leThis._gbaseApi._networkManager.doSendRequest(`${URIS['pvp.acceptMatch']}`, null, _aUniversalCallback);
        }
        function doWaitForOpponent(){
            clearTimeout(_to);

            leThis._gbaseApi._networkManager.doSendRequest(`${URIS['pvp.waitForOpponentToAccept']}`, null, _aUniversalCallback);
        }
        function doInitThePvp(body){
            clearTimeout(_to);

            leThis._currentPvp = new GbasePvp(leThis._gbaseApi, leThis, body.address, body.key, leThis._deferredConnection);
            leThis._currentlySearchingPvp = false;
            callback(null, new GbaseResponse(true, { pvp: leThis._currentPvp, originalResponse: body }));
        }

        doSearch();
    }

    _pvpVersusSelfCommon(requestLambda, callback){
        var leThis = this, theBody;

        function doSearch(){
            let callbackFn = (err, body) => {
                if(err){
                    leThis._currentlySearchingPvp = false;
                    if(err.details && (err.details.status === 404 || err.details.status === 503)){
                        callback(null, new GbaseResponse(false, { originalStatus: err.details.status, originalResponse: err }));
                    } else {
                        callback(err);
                    }
                } else if(body.c === 1){
                    doAccept();
                } else {
                    callback(null, new GbaseResponse(false, { originalResponse: body }));
                }
            };

            requestLambda(leThis, callbackFn);
        }
        function doAccept(){
            let callbackFn = (err, body) => {
                if(err){
                    leThis._currentlySearchingPvp = false;
                    if(err.details && (err.details.status === 404 || err.details.status === 503)){
                        callback(null, new GbaseResponse(false, { originalStatus: err.details.status, originalResponse: err }));
                    } else {
                        callback(err);
                    }
                } else if(body.c === 3){
                    theBody = body;
                    doInitThePvp();
                } else {
                    callback(null, new GbaseResponse(false, { originalResponse: body }));
                }
            };

            leThis._gbaseApi._networkManager.doSendRequest(`${URIS['pvp.acceptMatch']}`, null, callbackFn);
        }
        function doInitThePvp(){
            leThis._currentPvp = new GbasePvp(leThis._gbaseApi, leThis, theBody.address, theBody.key, leThis._deferredConnection);
            leThis._currentlySearchingPvp = false;
            callback(null, new GbaseResponse(true, { pvp: leThis._currentPvp, originalResponse: theBody }));
        }

        doSearch();
    }

    /**
     * Begin gameplay versus bot profile. Need backend to be configured with bots
     *
     * @param ranges {GbaseRangePicker} - an instance with ranges of search. See test examples
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    withBotOpponent(ranges, callback=NOOP){
        if(this._currentlySearchingPvp){
            return callback(new GbaseError('Already searching now. Stop searching before continue', 155));
        } else if(this._currentPvp){
            return callback(new GbaseError('Already in pvp right now', 156));
        } else if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 157));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 158));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 159));
        } else if(!ranges || !(ranges instanceof GbaseRangePicker) || !ranges.rgs.length){
            return callback(new GbaseError('Argument ranges is invalid', 160));
        }

        this._pvpVersusSelfCommon((leThis, callbackFn) => leThis._gbaseApi._networkManager.doSendRequest(
            `${URIS['pvp.searchForBotOpponent']}?strat=${MATCHMAKING_STRATEGIES_MAP.BY_RATING}`, ranges,
            callbackFn
        ), callback);
    }

    /**
     * Stops search  No guarantee that limit will be accurately at exact moment because process is abrupt
     *
     * @returns {*}
     */
    stopSearchingForOpponent(){
        if(!this._currentlySearchingPvp){
            return callback(new GbaseError('Does not search right now', 161));
        } else if(this._currentPvp){
            return callback(new GbaseError('Already in pvp right now', 162));
        } else if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 163));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 164));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 165));
        }

        this._currentlySearchingPvpContinuing = false;
    }

    /**
     * Start gameplay player versus self based on pvp framework. Pipeline is the same and all messages will return to you.
     * It's useful to use coupled with cloud functions.
     *
     * @param targetHumanId {Number} - some Human ID be provided to "pvpGeneratePayload" cloud function. Used to imitate gameplay versus some target opponent without his participate
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    beginVersusSelf(targetHumanId, callback=NOOP){
        if(this._currentlySearchingPvp){
            return callback(new GbaseError('Already searching now. Stop searching before continue', 166));
        } else if(this._currentPvp){
            return callback(new GbaseError('Already in pvp right now', 167));
        } else if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 168));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 169));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 170));
        } else if(!targetHumanId || typeof targetHumanId !== 'number' || targetHumanId < 1 || isNaN(targetHumanId)){
            return callback(new GbaseError('Argument targetHumanId invalid or empty - needed', 171));
        }

        this._pvpVersusSelfCommon((leThis, callbackFn) => leThis._gbaseApi._networkManager.doSendRequest(
            `${URIS['pvp.handSelectOpponent']}?hid=${targetHumanId}`, null,
            callbackFn
        ), callback);
    }

    /**
     * Continue pvp gameplay with some provided data. You can get it with method "checkBattleNoSearch"
     *
     * @param pvpRoomData {Object} - pvp data from "checkBattleNoSearch" method response
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    beginOnAddressAndKey(pvpRoomData, callback=NOOP){
        if(this._currentlySearchingPvp){
            return callback(new GbaseError('Already searching now. Stop searching before continue', 172));
        } else if(this._currentPvp){
            return callback(new GbaseError('Already in pvp right now', 173));
        } else if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 174));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 175));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 176));
        } else if(!pvpRoomData || !pvpRoomData.address || !pvpRoomData.key){
            return callback(new GbaseError('Argument pvpRoomData is invalid. It should have nodes: { address: ..., key: ... }', 177));
        }

        this._currentPvp = new GbasePvp(this._gbaseApi, this, pvpRoomData.address, pvpRoomData.key, this._deferredConnection);
        this._currentPvp.doConnect(null);
        callback(null, new GbaseResponse(true, { pvp: this._currentPvp }));
    }

    /**
     * Pvp gameplay may produce battle journal entry. It's made by calling function "appendBattleJournalPvp"
     * from cloud function "pvpGameOverHandler" or "pvpAutoCloseHandler".
     * It'll contain some details on battle plus schema-less data from cloud code programmer.
     *
     * @param skip {Number} - pagination skip
     * @param limit {Number} - pagination limit
     * @param onlyAuto {boolean} - list only entries produced from cloud function "pvpAutoCloseHandler"
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    battlesList(skip=0, limit=20, onlyAuto, callback=NOOP){
        if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 178));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 179));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile before', 180));
        } else if(typeof skip !== 'number' || skip < 0 || isNaN(skip)
            || typeof limit !== 'number' || limit < 1 || limit > 20 || isNaN(limit)){
            return callback(new GbaseError('Arguments are invalid', 181));
        }

        let callbackFn = (err, body) => {
            if(err){
                callback(err);
            } else {
                callback(null, new GbaseResponse(true, { originalResponse: body }));
            }
        };

        this._gbaseApi._networkManager.doSendRequest(
            `${URIS['battles.listBattles']}?offset=${skip}&limit=${limit}${onlyAuto ? '&auto=1' : ''}`,
            null, callbackFn
        );
    }
}

module.exports = GbasePvpApi;