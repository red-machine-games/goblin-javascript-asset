'use strict';

var SuperAgent = require('superagent'),
    crypto = require('crypto-js'),
    EventEmitter = require('eventemitter3'),
    WebSocket = require('isomorphic-ws');

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js');

const PING_INTERVAL_MS = 2 * 1000,
    TIMEOUT_MS = 15 * 1000,
    WS_MAX_RECONNECTION_TRYS = 20,
    WS_SEND_OPTS = { compress: false, mask: false, fin: true },
    REMEMBER_WS_MESSAGES_FOR_MS = 30 * 1000,
    PREINIT_MESSAGE = 'W8 for setup',
    NOOP = () => {};

const CONTENT_TYPE = 'application/json; charset=UTF-8';

class GameplayRoomNetworkManager extends EventEmitter{
    constructor(url, httpUrl, platform, semVersion, bookingKey, hmacSecret, gettingSequenceUri, _deferredConnection){
        super();
        this._url = url;
        this._httpUrl = httpUrl;
        this._platformVersion = `${platform};${semVersion}`;
        this._bookingKey = bookingKey;
        this._hmacSecret = hmacSecret;
        this.requestSequence = 1;
        this.wsSequence = 0;
        this.opponentSequence = 0;
        this._gettingSequenceUri = gettingSequenceUri;

        this.myAveragePing = 1;
        this.opponentAveragePing = 1;

        this._theQueue = [];
        this._theQueueCurrentlyProcessing = false;

        this._wsReconnectionTry = 0;
        this._wsConnection = null;
        this._wsConnectionListeners = null;
        this._wsConnectionIsReady = false;
        this._wsActivityPaused = false;
        this._wsPingSent = null;
        this._wsPing = 1;
        this._wsQueue = [];
        this._wsRememberingQueue = [];
        this.laClosed = false;

        this._heartbeatInterval = setInterval(() => this._heartbeat(), PING_INTERVAL_MS);
        this._heartbeatLastMsg = Date.now();
        this._heartbeatIntervalDone = false;

        this._deferredConnection = _deferredConnection;
    }
    _heartbeat(){
        if(this._heartbeatIntervalDone){
            return clearInterval(this._heartbeatInterval);
        }
        if(this._wsConnection && this._wsConnection.readyState === 1){
            this._wsPingSent = Date.now();
            if(this._wsPingSent - this._heartbeatLastMsg >= PING_INTERVAL_MS * 5){
                this.reconnectWs();
            } else {
                this._wsConnection.send(JSON.stringify({ ping: this._wsPing }), WS_SEND_OPTS);
            }
        }
        if(!this._wsActivityPaused){
            let theNow = Date.now();
            for(let i = this._wsRememberingQueue.length - 1 ; i >= 0 ; i--){
                if(this._wsRememberingQueue[i].dob + REMEMBER_WS_MESSAGES_FOR_MS < theNow){
                    this._wsRememberingQueue.splice(i, 1);
                }
            }
        }
    }
    makePaused(_p){
        var _okay = this._wsActivityPaused !== _p;
        this._wsActivityPaused = _p;
        return _okay;
    }
    makeRequest(uri, body, callback, _noHmacCheckEtc){
        let callbackFn = (err, body) => {
            if(!err && body && (body.c === 0 || body.c === 1)){
                this._makeWsConnection();
            }
            callback(err, body);
        };

        this._theQueue.unshift(new EnqueuedRequest(uri, body, callbackFn, _noHmacCheckEtc));
        this._pokeQueue();
    }
    _makeWsConnection(pushPrevLock){
        var laThis = this;

        function doMake(){
            var theUrl = `${laThis._url}?pv=${laThis._platformVersion}&bkey=${laThis._bookingKey}${pushPrevLock ? '&f=1' : ''}`;
            try{
                var laWs = new WebSocket(theUrl);
            } catch(err){
                return handleError(new GbaseError('Connection errored', 280, { originalResponse: err }));
            }

            laThis._wsConnectionListeners = {
                error: errorMessage => {
                    if(laThis._wsConnectionListeners){
                        laWs.removeEventListener('error', laThis._wsConnectionListeners.error);
                        laWs.removeEventListener('open', laThis._wsConnectionListeners.open);
                        laWs.removeEventListener('message', laThis._wsConnectionListeners.message);
                        laWs.removeEventListener('close', laThis._wsConnectionListeners.close);
                        laThis._wsConnectionListeners = null;
                    }
                    handleError(errorMessage.error);
                },
                open: handleOpen,
                message: messageEvent => handleMessage(messageEvent.data),
                close: closeEvent => {
                    if(laThis._wsConnectionListeners){
                        laWs.removeEventListener('error', laThis._wsConnectionListeners.error);
                        laWs.removeEventListener('open', laThis._wsConnectionListeners.open);
                        laWs.removeEventListener('message', laThis._wsConnectionListeners.message);
                        laWs.removeEventListener('close', laThis._wsConnectionListeners.close);
                        laThis._wsConnectionListeners = null;
                    }
                    handleClose(closeEvent.code, closeEvent.reason);
                }
            };

            laWs.addEventListener('error', laThis._wsConnectionListeners.error);
            laWs.addEventListener('open', laThis._wsConnectionListeners.open);
            laWs.addEventListener('message', laThis._wsConnectionListeners.message);
            laWs.addEventListener('close', laThis._wsConnectionListeners.close);

            laThis._wsConnection = laWs;
        }
        function handleError(err){
            laThis._wsConnectionIsReady = false;
            laThis.requestSequence = 1;
            laThis.wsSequence = 0;
            if(laThis._wsConnection && laThis._wsConnection.readyState < 1){
                if(++laThis._wsReconnectionTry >= WS_MAX_RECONNECTION_TRYS){
                    laThis._wsReconnectionTry = 0;
                    laThis._wsConnection = null;
                    laThis.emit('error', err);
                } else {
                    laThis.reconnectWs();
                }
            } else {
                laThis.emit('error', err);
            }
        }
        function handleOpen(){
            laThis._wsReconnectionTry = 0;
            laThis._wsConnectionIsReady = true;
            laThis._pokeWsQueue();
            laThis.emit('ready');

            laThis.makeRequest(laThis._gettingSequenceUri, null, NOOP, true);
        }
        function handleMessage(msg){
            laThis._heartbeatLastMsg = Date.now();
            if(msg.startsWith('{') || msg.startsWith('[')){
                try{
                    msg = JSON.parse(msg);
                } catch(err){
                    return laThis.emit('error', err);
                }
                if(typeof msg.yrAvg === 'number' && typeof msg.oppAvg === 'number'){
                    if(laThis._wsPingSent){
                        laThis._wsPing = Date.now() - laThis._wsPingSent;
                        laThis._wsPingSent = null;
                    }
                } else if(msg.oppsq == null || msg.oppsq === laThis.opponentSequence + 1){
                    if(msg.oppsq != null){
                        laThis.opponentSequence = msg.oppsq;
                    }
                    laThis.emit('message', msg);
                } else if(msg.m){
                    laThis.emit('message', msg);
                } else if(typeof msg.preGame !== 'number'){
                    laThis.emit('error', new GbaseError('Opponent message came in wrong sequence', 82, { originalMessage: msg, messageSequence: msg.oppsq, shouldBe: laThis.opponentSequence + 2 }));
                }
            } else if(msg.startsWith('-{') || msg.startsWith('-[')){
                try{
                    msg = JSON.parse(msg.slice(1));
                } catch(err){
                    return laThis.emit('error', err);
                }
                laThis.emit('message', msg, true);
            } else if(msg !== PREINIT_MESSAGE){
                laThis.emit('error', new GbaseError('Unknown incoming message', 83, { originalMessage: msg }));
            }
        }
        function handleClose(code, msg){
            laThis.requestSequence = 1;
            laThis.wsSequence = 0;
            laThis._wsConnectionIsReady = false;
            laThis._wsPingSent = null;

            function normalClose(){
                try{
                    msg = JSON.parse(msg);
                } catch(err){
                    laThis.emit('error', err);
                    msg = undefined;
                }
                if(msg.gameIsOver){
                    laThis.laClose(msg.finalm, msg);
                } else {
                    laThis.laClose(msg.m, msg);
                }
            }

            if(code === 1000){
                normalClose();
            } else if(code > 1000 && code < 4000){
                if(code === 1011){
                    laThis.emit('error', new GbaseError('Server-side error occurred', 84, { originalMessage: msg }));
                }
                laThis.reconnectWs();
            } else {
                switch(code){
                    case 4200: normalClose(); break;
                    case 4400:
                        if(typeof msg !== 'object'){
                            msg = JSON.parse(msg);
                        }
                        if([374, 380, 385, 425, 387].includes(msg.index)){
                            laThis.laClose('Pair was not found. It\'s done or ttl is out', msg);
                        } else {
                            laThis.emit('error', new GbaseError('Client-side error occurred', 85, { originalMessage: msg }));
                            laThis.reconnectWs();
                        }
                        break;
                }
            }
        }

        if(!this._wsConnection || this._wsConnection.readyState > 1){
            if(this._deferredConnection){
                this._wsConnection = { readyState: -1 };
                setTimeout(doMake, this._deferredConnection);
            } else {
                doMake();
            }
        }
    }
    dropWs(){
        if(this.laClosed){
            throw new GbaseError('This instance of gameroom connection is already done', 279);
        }

        if(this._wsConnection){
            this._actuallyClose();
        }

        this._wsConnectionIsReady = false;
        this._wsPingSent = null;
    }
    reconnectWs(){
        if(this.laClosed){
            throw new GbaseError('This instance of gameroom connection is already done', 86);
        }

        if(this._wsConnection){
            this._actuallyClose();
        }
        this._makeWsConnection(true);
    }
    _pokeWsQueue(){
        if(this._wsQueue.length){
            let theMessage = this._wsQueue.pop();
            if(this.sendWsMessage(theMessage, theMessage.isDirect, true)){
                setTimeout(() => this._pokeWsQueue(), 0);
            }
        }
    }
    sendWsMessage(theMessage, direct, toPush=false){
        if(this.laClosed){
            throw new GbaseError('This instance of gameroom connection is already done', 87);
        }
        if(this._wsConnection && this._wsConnection.readyState === 1 && this._wsConnectionIsReady && !this._wsActivityPaused){
            if(direct){
                this._wsConnection.send(`-${JSON.stringify(typeof theMessage === 'object' ? theMessage : { message: theMessage })}`);
            } else {
                let messageToSend, toSign;
                if(theMessage instanceof RememberedWebsocketMessage){
                    this.wsSequence = theMessage.sequence;
                    messageToSend = theMessage.theMessage;
                } else {
                    this.wsSequence++;
                    messageToSend = { mysq: this.wsSequence, m: (typeof theMessage === 'object') ? theMessage : { message: theMessage } };
                    toSign = `/${JSON.stringify(messageToSend)}${this._bookingKey}${this._hmacSecret}`;
                    messageToSend.sign = crypto.enc.Hex.stringify(crypto.SHA256(toSign));
                }
                this._wsRememberingQueue.push(new RememberedWebsocketMessage(messageToSend, this.wsSequence));
                this._wsConnection.send(JSON.stringify(messageToSend));
            }
            return true;
        } else {
            this._wsQueue[toPush ? 'push' : 'unshift'](new EnqueuedWebsocketMessage(theMessage, direct));
            return false;
        }
    }
    backupWsMessages(fromSequence, opponentSequence, onlyForward=false){
        if(this.laClosed){
            throw new GbaseError('This instance of gameroom connection is already done', 89);
        }
        this._wsActivityPaused = false;
        if(opponentSequence != null){
            this.opponentSequence = onlyForward ? Math.max(opponentSequence, this.opponentSequence) : opponentSequence;
        }
        if(fromSequence === this.wsSequence || (onlyForward && this.wsSequence >= fromSequence)){
            this._pokeWsQueue();
            return true;
        } else {
            let okay = false,
                wsRememberingQueueLength = this._wsRememberingQueue.length;
            for(let i = 0 ; i < wsRememberingQueueLength ; i++){
                if(this._wsRememberingQueue[i].sequence > fromSequence){
                    this._wsQueue.unshift(this._wsRememberingQueue[i]);
                    okay = true;
                }
            }
            this.wsSequence = fromSequence;
            this._wsRememberingQueue = [];
            if(okay){
                this._pokeWsQueue();
                return true;
            } else {
                this._wsQueue = [];
                return false;
            }
        }
    }
    wsConnectionIsUp(){
        return (this._wsConnection && this._wsConnection.readyState === 1 && this._wsConnectionIsReady);
    }
    _pokeQueue(){
        if(this._theQueue && this._theQueue.length && !this._theQueueCurrentlyProcessing){
            let reqToDo = this._theQueue.pop();
            this._doSendRequest(reqToDo.uri, reqToDo.body, reqToDo.callback, reqToDo._noHmacCheckEtc);
        }
    }
    _doSendRequest(uri, body, callback, _noHmacCheckEtc){
        if(this.laClosed){
            throw new GbaseError('This instance of gameroom connection is already done', 88);
        }
        let callbackFn = (err, res) => {
            this._theQueueCurrentlyProcessing = false;
            if(err && !err.status){
                if(err.timeout){
                    callback(new GbaseError('Request timeout', 90));
                } else {
                    callback(new GbaseError('Some connection error occur', 91, err));
                }
            } else if(res.status === 200){
                if(typeof res.body.sequence === 'number' && !isNaN(res.body.sequence)){
                    if(this._wsConnection && this._wsConnection.readyState === 1 && this.requestSequence == null){
                        this.requestSequence = res.body.sequence;
                    }
                }
                callback(null, res.body);
            } else {
                callback(new GbaseError('Some logic error occur', 92, { status: res.status, body: res.body }));
            }
            this._pokeQueue();
        };

        this._theQueueCurrentlyProcessing = true;
        var theUri = uri.startsWith('/') ? uri : `/${uri}`,
            theReq = SuperAgent[body ? 'post' : 'get'](`${this._httpUrl}${theUri}`);
        if(body && Object.keys(body).length){
            theReq = theReq.send(body);
        }
        theReq
            .set('Content-Type', CONTENT_TYPE)
            .set('X-Platform-Version', this._platformVersion);
        if(!_noHmacCheckEtc){
            theReq
                .set('X-Req-Seq', this.requestSequence)
                .set('X-Request-Sign', this._generateSign(theUri, body, this.requestSequence++, this._bookingKey, this._hmacSecret));
        }
        if(this._bookingKey){
            theReq = theReq.set('X-Book-Key', this._bookingKey);
        }
        theReq
            .timeout({ response: TIMEOUT_MS, deadline: TIMEOUT_MS * 2 })
            .end(callbackFn);
    }
    _generateSign(uri, body, reqSeq, bookingKey, hmacSecret){
        var toSign = uri;
        if (body && (typeof body !== 'object' || (Array.isArray(body) && body.length) || (!Array.isArray(body) && typeof body === 'object' && Object.keys(body).length))){
            if(typeof body === 'string'){
                toSign += body;
            } else {
                try{
                    toSign += JSON.stringify(body);
                } catch(err){}
            }
        }
        toSign += reqSeq;
        if(bookingKey){
            toSign += bookingKey;
        }
        toSign += hmacSecret;

        return crypto.enc.Hex.stringify(crypto.SHA256(toSign));
    }
    laClose(theMessage, originalResponse){
        this.laClosed = true;
        clearInterval(this._heartbeatInterval);
        this._heartbeatIntervalDone = true;
        if(this._wsConnection){
            this._actuallyClose();
        }
        if(theMessage){
            this.emit('close', new GbaseResponse(true, originalResponse ? { endMessage: theMessage, originalResponse } : { endMessage: theMessage }));
        }
    }
    _actuallyClose(){
        if(this._wsConnectionListeners){
            this._wsConnection.removeEventListener('error', this._wsConnectionListeners.error);
            this._wsConnection.removeEventListener('open', this._wsConnectionListeners.open);
            this._wsConnection.removeEventListener('message', this._wsConnectionListeners.message);
            this._wsConnection.removeEventListener('close', this._wsConnectionListeners.close);
            this._wsConnectionListeners = null;
        }
        if(this._wsConnection.readyState === 1 || !this._wsConnection.terminate){
            this._wsConnection.close();
        } else {
            this._wsConnection.terminate();
        }
        this._wsConnection = null;
    }
}

class EnqueuedRequest{
    constructor(uri, body, callback, _noHmacCheckEtc){
        this.uri = uri;
        this.body = body;
        this.callback = callback;
        this._noHmacCheckEtc = _noHmacCheckEtc;
    }
}
class EnqueuedWebsocketMessage{
    constructor(theMessage, isDirect){
        this.theMessage = theMessage;
        this.isDirect = isDirect;
    }
}
class RememberedWebsocketMessage extends EnqueuedWebsocketMessage{
    constructor(theMessage, sequence){
        super(theMessage, false);
        this.sequence = sequence;
        this.dob = Date.now();
    }
}

module.exports = GameplayRoomNetworkManager;