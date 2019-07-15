'use strict';

var EventEmitter = require('eventemitter3');

var GbaseResponse = require('../objects/GbaseResponse.js'),
    GbaseError = require('../objects/GbaseError.js');

var GameplayRoomNetworkManager = require('./GameplayRoomNetworkManager.js');

const URI_PREFIX = 'v0',
    URIS = {
        ['releaseBooking']: `${URI_PREFIX}/releaseBooking`,
        ['setPayload']: `${URI_PREFIX}/setPayload`,
        ['setReady']: `${URI_PREFIX}/setReady`,
        ['surrender']: `${URI_PREFIX}/surrender`,
        ['utils.getSequence']: `${URI_PREFIX}/utils.getSequence`,
        ['utils.getTurnSequence']: `${URI_PREFIX}/utils.getTurnSequence`
    },
    PREINIT_MESSAGE = 'W8 for setup';

class GbasePvp extends EventEmitter{
    /**
     * A pvp instance produced by {GbasePvpApi}. It emits the next events: "progress"(representing connection progress, providing progress message),
     * "begin"(representing a start of gameplay. You can start your game after that), "error"(on any errors), "direct-message"(on direct message),
     * "turn-message"(on turn message), "model"(providing an information about model. Usually after reconnection),
     * "paused"(when game went on pause), "unpaused"(when game returns from pause),
     * "sync"(representing need to sync your local model or state with backend's. Not a frequent but usually if game is paused and client thinks that you lost some messages),
     * "finish"(representing finish of pvp match. GbasePvp instance is now done)
     *
     */
    constructor(gbaseApiInstance, gbasePvpApiInstance, pvpRoomAddress, pvpRoomKey, _deferredConnection){
        super();
        this._gbaseApiInstance = gbaseApiInstance;
        this._gbasePvpApiInstance = gbasePvpApiInstance;
        this.address = pvpRoomAddress;
        this.key = pvpRoomKey;

        if(this.address.hosts.asDomain){
            if(this.address.ports.wss){
                this.endpoint = `wss://${this.address.hosts.asDomain}:${this.address.ports.wss}`;
                this.httpEndpoint = `https://${this.address.hosts.asDomain}:${this.address.ports.wss}`;
            } else {
                this.endpoint = `ws://${this.address.hosts.asDomain}:${this.address.ports.ws}`;
                this.httpEndpoint = `http://${this.address.hosts.asDomain}:${this.address.ports.ws}`;
            }
        } else {
            this.endpoint = `ws://${this.address.hosts.asIP}:${this.address.ports.ws}`;
            this.httpEndpoint = `http://${this.address.hosts.asIP}:${this.address.ports.ws}`;
        }

        this._networkManager = new GameplayRoomNetworkManager(
            this.endpoint, this.httpEndpoint, this._gbaseApiInstance._platform, this._gbaseApiInstance._version,
            this.key, this._gbaseApiInstance._hmacSecret, URIS['utils.getSequence'], _deferredConnection
        );

        this._opponentPayload = null;
        this._startTimestamp = null;
        this._randomSeed = null;
        this._meIsPlayerA = null;

        this._connectionInProgress = false;
        this._listenersAreOn = false;
        this._begin = false;
        if(this._gbaseApiInstance.disallowDirectProfileExposure){
            this.doConnect();
        }
        this._isFullyDone = false;
        this._currentlyOnPause = false;
    }

    /**
     * Necessary action starting process of connection till "begin" event.
     *
     * @param payloadObject {Object} - A payload that model will be built with. This data will get into cloud function "pvpGeneratePayload"
     */
    doConnect(payloadObject){
        var leThis = this;

        function checkIamThereAlready(){
            let callbackFn = err => {
                if(err){
                    if(err instanceof GbaseError && err.details.status === 400 && ([616, 422].includes(err.details.body.index))){
                        hangListeners();
                        releaseBooking();
                    } else {
                        leThis.emit('error', err);
                    }
                } else {
                    hangListeners();
                    leThis._networkManager.reconnectWs();
                }
            };

            leThis._networkManager.makeRequest(URIS['utils.getSequence'], null, callbackFn, true);
        }
        function releaseBooking(){
            let callbackFn = err => {
                if(err){
                    leThis.emit('error', err);
                } else {
                    setPayload();
                }
            };

            leThis._networkManager.makeRequest(URIS['releaseBooking'], {}, callbackFn);
        }
        function setPayload(){
            let callbackFn = err => {
                if(err){
                    leThis.emit('error', err);
                } else {
                    setReady();
                }
            };

            leThis._networkManager.makeRequest(URIS['setPayload'], payloadObject || {}, callbackFn);
        }
        function setReady(){
            let callbackFn = (err, body) => {
                if(err){
                    leThis.emit('error', err);
                } else {
                    leThis._opponentPayload = body.oppPayload;
                    leThis._startTimestamp = body.startTs;
                    leThis._randomSeed = body.randomSeed;
                    if(body.p === 4 && body.c === 3 && !leThis._begin && leThis._networkManager.wsConnectionIsUp()){
                        leThis._begin = true;
                        leThis.emit('begin', body.m);
                    }
                }
            };

            leThis._networkManager.makeRequest(URIS['setReady'], {}, callbackFn);
        }
        function hangListeners(){
            leThis._networkManager.on('message', _onMessage);
            leThis._networkManager.on('close', _onConnectionClose);
            leThis._networkManager.on('error', _onError);
            leThis._listenersAreOn = true;
        }
        function _onMessage(theMessage, isDirect){
            if(isDirect){
                leThis.emit('direct-message', theMessage);
            } else {
                if(theMessage === PREINIT_MESSAGE
                        || (Object.keys(theMessage).length === 1
                            && (typeof theMessage.preGame === 'number' || theMessage.m === 'GR: force closed con'))){
                    return;
                }
                if(theMessage.p === 4 && theMessage.c === 3 && theMessage.paused != null){
                    return handlePause(!!theMessage.paused, theMessage.turn, theMessage.m);
                }
                if(theMessage.p >= 1 && theMessage.p <= 4){
                    if(theMessage.isA != null){
                        leThis._meIsPlayerA = theMessage.isA;
                    }
                    if(theMessage.oppPayload != null){
                        leThis._opponentPayload = theMessage.oppPayload;
                    }
                    if(theMessage.startTs != null){
                        leThis._startTimestamp = theMessage.startTs;
                    }
                    if(theMessage.randomSeed != null){
                        leThis._randomSeed = theMessage.randomSeed;
                    }
                    if(leThis._begin){
                        return;
                    } else if(theMessage.p === 4 && theMessage.c === 3){
                        leThis._begin = true;
                        return leThis.emit('begin', theMessage.m);
                    } else {
                        return leThis.emit('progress', theMessage.m);
                    }
                }
                if(theMessage.c === -1){
                    return leThis._networkManager.laClose(theMessage.m);
                }
                if(theMessage.c >= 0 && theMessage.c <= 4){
                    if(theMessage.oppPayload != null){
                        leThis._opponentPayload = theMessage.oppPayload;
                    }
                    if(theMessage.state != null){
                        leThis._meIsPlayerA = !!theMessage.state.isA;
                        leThis._startTimestamp = theMessage.state.startTs;
                        leThis._randomSeed = theMessage.state.randomSeed;
                        if(!leThis._begin){
                            leThis._begin = true;
                            leThis.emit('begin');
                        }
                        let myTurn = leThis._meIsPlayerA ? theMessage.state.playerTurnA : theMessage.state.playerTurnB,
                            opponentTurn = leThis._meIsPlayerA ? theMessage.state.playerTurnB : theMessage.state.playerTurnA;
                        if(leThis._networkManager.backupWsMessages(myTurn, opponentTurn, true)){
                            leThis.emit('model', theMessage.state.model);
                        } else {
                            leThis.emit('sync', theMessage.state.model);
                        }
                    }
                    if(theMessage.m){
                        leThis.emit('progress', theMessage.m);
                    }
                    if(theMessage.m || theMessage.state){
                        return;
                    }
                }
                if(theMessage.error){
                    leThis.emit('error', theMessage.error);
                } else if(theMessage.m){
                    leThis.emit('turn-message', theMessage.m);
                }
            }
        }
        function handlePause(isPaused, myTurn, messageThatWillGoOut){
            if(isPaused){
                if(!leThis._currentlyOnPause){
                    leThis._currentlyOnPause = isPaused;
                    if(leThis._networkManager.makePaused(true)){
                        leThis.emit('paused', messageThatWillGoOut);
                    }
                }
            } else if(leThis._currentlyOnPause){
                leThis._currentlyOnPause = isPaused;
                leThis.emit('unpaused', messageThatWillGoOut);
                if(!leThis._networkManager.backupWsMessages(myTurn)){
                    leThis.emit('sync');
                }
            }
        }
        function _onConnectionClose(theResponse){
            leThis._networkManager.removeListener('message', _onMessage);
            leThis._networkManager.removeListener('close', _onConnectionClose);
            leThis._networkManager.removeListener('error', _onError);
            leThis._listenersAreOn = false;
            leThis._isFullyDone = true;
            leThis._gbasePvpApiInstance._currentPvp = null;
            leThis.emit('finish', theResponse);
        }
        function _onError(theError){
            leThis.emit('error', theError);
        }

        if(!this._connectionInProgress && !this._isFullyDone && !this._networkManager.laClosed){
            this._connectionInProgress = true;
            checkIamThereAlready();
        }
    }

    /**
     * @returns {Number} - My ping in ms
     */
    get myPing(){
        return this._networkManager.myAveragePing;
    }

    /**
     * @returns {Number} - Opponent's ping in ms
     */
    get opponentPing(){
        return this._networkManager.opponentAveragePing;
    }

    /**
     * @returns {boolean} - Whatever gameplay paused now
     */
    get isPaused(){
        return this._currentlyOnPause;
    }

    /**
     * @returns {object} - Opponent's payload that was built with cloud function "pvpGeneratePayload" or provided directly by him.
     */
    get opponentPayload(){
        return this._opponentPayload;
    }

    /**
     * @returns {Number} - A timestamp of gameplay's start at UTF-0
     */
    get startTimestamp(){
        return this._startTimestamp;
    }

    /**
     * @returns {Number} - A random seed used to produce random values with Mersenne Twister
     */
    get randomSeed(){
        return this._randomSeed;
    }

    /**
     * @returns {boolean} - Whatever you are player A
     */
    get meIsPlayerA(){
        return this._meIsPlayerA;
    }

    /**
     * Send turn message to your opponent. It will get into cloud function "pvpTurnHandler" if presented. The idea of turn messages
     * is that all they proceed in strict order with queue and directed to modify model. It is good practice to not to send turn messages
     * more frequently than once per second. Message should be an object
     *
     * @param turnMessage {Object} - a message to send
     */
    sendTurn(turnMessage){
        if(this._currentlyOnPause){
            throw new GbaseError('Gameplay is paused currently', 138);
        }
        this._networkManager.sendWsMessage(turnMessage, false);
    }

    /**
     * Send direct message to your opponent. It will be resend to him directly without queue, modification of model or calling
     * any cloud function. It makes this type of messages the best way to hertz real-time gameplay, but the good practice will be
     * to not to send this type of messages more frequently than 15 times per second. Message should be an object
     *
     * @param directMessage {Object} - a message to send
     */
    sendDirect(directMessage){
        if(this._currentlyOnPause){
            throw new GbaseError('Gameplay is paused currently', 139);
        }
        this._networkManager.sendWsMessage(directMessage, true);
    }

    forceDisconnect(){
        this._networkManager.dropWs();
    }
    reconnect(){
        this._networkManager.reconnectWs();
    }

    /**
     * Destroys pvp-client and emits "finish" event. Your opponent will be paused some time but later see "finish" event
     * with message of automatic game over(or dead pair)
     */
    forceDestroyClient(){
        this._isFullyDone = true;
        this._gbasePvpApiInstance._currentPvp = null;
        this._networkManager.laClose('Forced to close client-side');
        if(!this._listenersAreOn){
            this.emit('finish', new GbaseResponse(true, { endMessage: 'Forced to close client-side' }));
        }
    }
}

module.exports = GbasePvp;