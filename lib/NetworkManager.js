'use strict';

var SuperAgent = require('superagent'),
    crypto = require('crypto-js'),
    EventEmitter = require('eventemitter3');

var GbaseError = require('./objects/GbaseError.js');

const MAX_REPEAT_COUNT = 2,
    TIMEOUT_MS = 15 * 1000,
    PING_DELTA_TIME_MS = 10 * 1000,
    NO_INPUT_DELTA_TIME_MS = 20 * 1000,
    SERVER_UNDER_MAINTENANCE_DELAY_MS = 3 * 1000,
    SERVER_UNDER_MAINTENANCE_REREQUEST_TRIES = 6,
    HEARTBEAT_EVERY_MS = 1000;

const CONTENT_TYPE = 'application/json; charset=UTF-8';

class NetworkManager extends EventEmitter{
    constructor(url, hmacSecret, platform, semVersion, pingServerUri){
        super();
        this.url = url;
        this.hmacSecret = hmacSecret;
        this.platformVersion = `${platform};${semVersion}`;

        this.lastAct = Date.now();
        this.lastPing = Date.now();
        this.pausePing = false;

        this.requestSequence = 0;
        this.currentUnicorn = null;

        this.theQueue = [];
        this.theQueueCurrentlyProcessing = false;
        this._pingServerUri = pingServerUri;
        setInterval(() => this.heartbeat(), HEARTBEAT_EVERY_MS);
    }
    someInputBeenDone(){
        this.lastAct = Date.now();
    }
    dropSession(){
        this.requestSequence = 0;
        this.currentUnicorn = null;
        this.pausePing = false;
    }
    heartbeat(){
        var now = Date.now(),
            deltaAct = now - this.lastAct,
            deltaPing = now - this.lastPing;

        if(!this.pausePing && this.currentUnicorn && (deltaPing >= PING_DELTA_TIME_MS && deltaAct < NO_INPUT_DELTA_TIME_MS)){
            this.lastPing = now;
            this.doPingServer();
        }
    }
    doPingServer(){
        let callbackFn = err => {
            if(err){
                this.pausePing = true;
                this.emit('pingfail');
            }
        };

        this.doTheRequest(this._pingServerUri, null, callbackFn);
    }
    doTheRequest(uri, body, callback){
        let callbackFn = (err, body) => {
            if(err){
                if(err.code !== 3){
                    if(err.code !== 4){
                        this.dropQueue();
                        this.theQueueCurrentlyProcessing = false;
                    }
                    callback(err);
                } else {
                    // setTimeout(() => this.workoutMaybeSpecialCase(err, callback, laRequest), 0);
                    this.workoutMaybeSpecialCase(err, callback, laRequest);
                }
            } else {
                this.theQueueCurrentlyProcessing = false;
                this.pokeQueue();
                callback(null, body);
            }
        };
        var laRequest = new EnqueuedRequest(uri, body, callbackFn);
        this.theQueue.unshift(laRequest);
        this.pokeQueue();
    }
    pokeQueue(){
        if(this.theQueue && this.theQueue.length && !this.theQueueCurrentlyProcessing){
            let reqToDo = this.theQueue.pop();
            // setTimeout(() => this.doSendRequest(reqToDo.url, reqToDo.body, reqToDo.callback), 0);
            this.theQueueCurrentlyProcessing = true;
            this.doSendRequest(reqToDo.url, reqToDo.body, reqToDo.callback);
        }
    }
    dropQueue(){
        if(this.theQueue && this.theQueue.length){
            for(let i = this.theQueue.length - 1 ; i >= 0 ; i--){
                let _req = this.theQueue[i];
                if(_req.callback){
                    _req.callback(new GbaseError('Some early request got failed', 4));
                }
            }
        }
        this.theQueue = [];
    }
    doSendRequest(uri, body, callback, theTry=0){
        var pingRequest = (uri === this._pingServerUri);
        if(pingRequest && !this.currentUnicorn){
            return callback(null, null);
        }

        let callbackFn = (err, res) => {
            if(pingRequest){
                return callback((err && err.status === 401) ? new GbaseError('Ping unauthorized', 311, err) : null, null);
            }
            if(err && !err.status){
                if(err.timeout){
                    if(theTry < MAX_REPEAT_COUNT){
                        this.doSendRequest(uri, body, callback, theTry + 1)
                    } else {
                        callback(new GbaseError('Request timeout', 1));
                    }
                } else {
                    callback(new GbaseError('Some connection error occur', 2, err));
                }
            } else if(res.status === 200){
                if(res.body && res.body.unicorn){
                    this.requestSequence = 1;
                    this.currentUnicorn = res.body.unicorn;
                    this.pausePing = false;
                }
                callback(null, res.body);
            } else if(res.status === 401){
                this.workoutUnauthorizedSpecialCase(res.body, callback);
            } else {
                callback(new GbaseError('Some logic error occur', 3, { status: res.status, body: res.body }));
            }
        };

        var theUri = uri.startsWith('/') ? uri : `/${uri}`,
            theReq = SuperAgent[body ? 'post' : 'get'](`${this.url}${theUri}`);
        if(body && Object.keys(body).length){
            theReq = theReq.send(body);
        }
        theReq = theReq
            .set('Content-Type', CONTENT_TYPE)
            .set('X-Platform-Version', this.platformVersion);
        if(!pingRequest){
            theReq = theReq
                .set('X-Req-Seq', this.requestSequence)
                .set('X-Request-Sign', this.generateSign(theUri, body, this.requestSequence++, this.currentUnicorn, this.hmacSecret));
        }
        if(this.currentUnicorn){
            theReq = theReq.set('X-Unicorn', this.currentUnicorn);
        }

        theReq
            .timeout({ response: TIMEOUT_MS, deadline: TIMEOUT_MS * 2 })
            .end(callbackFn);
    }
    generateSign(uri, body, reqSeq, unicorn, hmacSecret){
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
        if(unicorn){
            toSign += unicorn;
        }
        toSign += hmacSecret;

        return crypto.enc.Hex.stringify(crypto.SHA256(toSign));
    }
    workoutMaybeSpecialCase(theError, callback, originalRequest){
        if(theError.details.body && theError.details.body.index){
            switch(theError.details.body.index){
                case 389:
                case 390:
                case 391:
                case 392:
                case 393:
                case 397:
                case 398:
                case 399:
                case 400:
                case 401:
                case 402:
                    this.theQueueCurrentlyProcessing = false;
                    this.dropQueue();
                    callback(new GbaseError('Problems with HMAC', 6, { originalError: theError.details.body }));
                    break;
                case 423:
                case 891:
                    this.theQueueCurrentlyProcessing = false;
                    this.dropQueue();
                    callback(new GbaseError('Session is dead. Get new one - reAuth', 7, { originalError: theError.details.body }));
                    break;
                case 963:
                case 967:
                    this.theQueueCurrentlyProcessing = false;
                    this.dropQueue();
                    callback(new GbaseError('Gbase backend is currently at maintenance. Try again later', 8, { originalError: theError.details.body }));
                    break;
                case 592:
                case 1078:
                    if(originalRequest.tries === -1 || originalRequest.tries > 0){
                        originalRequest.tries = (originalRequest.tries < 0) ? SERVER_UNDER_MAINTENANCE_REREQUEST_TRIES : originalRequest.tries - 1;
                        this.theQueue.push(originalRequest);
                        setTimeout(() => {
                            this.theQueueCurrentlyProcessing = false;
                            this.pokeQueue();
                        }, SERVER_UNDER_MAINTENANCE_DELAY_MS);
                    } else {
                        this.theQueueCurrentlyProcessing = false;
                        this.dropQueue();
                        callback(new GbaseError('Gbase backend is heavy loaded right now. Try again later', 9, { originalError: theError.details.body }));
                    }
                    break;
                case 404:
                    this.theQueueCurrentlyProcessing = false;
                    this.dropQueue();
                    callback(new GbaseError('According to version your client is out of date. Force user to update', 10, { originalError: theError.details.body }));
                    break;
                default:
                    this.theQueueCurrentlyProcessing = false;
                    this.dropQueue();
                    callback(theError || new GbaseError('Gbase backend respond with error', 11, { originalError: theError.details.body }));
            }
        } else {
            this.theQueueCurrentlyProcessing = false;
            this.dropQueue();
            callback(theError || new GbaseError('Unknown error', 5));
        }
    }
    workoutUnauthorizedSpecialCase(requestBody, callback){
        switch(requestBody.index){
            case 699:
                callback(new GbaseError('Parallel request prevented. This is abnormal case', 309, { originalStatus: 401, originalError: requestBody }));
                break;
            case 423:
            case 424:
            case 891:
            case 892:
                callback(new GbaseError('Looks like session is dead. Re-auth or fully reboot your app', 310, { originalStatus: 401, originalError: requestBody }));
                break;
            default:
                callback(new GbaseError('Some auth problem', 315, { originalStatus: 401, originalError: requestBody }))
        }
    }
}

class EnqueuedRequest{
    constructor(url, body, callback, tries=-1){
        this.url = url;
        this.body = body;
        this.callback = callback;
        this.tries = tries;
    }
}

module.exports = NetworkManager;