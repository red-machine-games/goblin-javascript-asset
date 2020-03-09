'use strict';

const MAX_SUBSCRIBE_GAP_WITHOUT_LOAD_HISTORY_MS = 1000 * 30,
    PAGE_SIZE = 20;

var EventEmitter = require('eventemitter3');

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js'),
    GbaseConstants = require('../GbaseConstants.js'),
    ChatMessage = require('../objects/ChatMessage.js');

var someUtils = require('../utils/someUtils.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP;

class GroupChat extends EventEmitter{
    constructor(header, _gbaseApi){
        super();
        this.header = header;
        this._gbaseApi = _gbaseApi;
        this._fetching = false;
        this._subscribed = null;
        this._mostFarHistoryMessage = null;

        this.historyOfSequenceNumbers = [];
    }
    listen(callback=NOOP){
        return someUtils.promisify(callback, callback => {
            this._fetching = true;
            this._fetch(callback);
        });
    }
    loadHistory(callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 9999));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 9999));
            } else if(!this._subscribed){
                return callback(new GbaseError('You have to listen first', 9999));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    for(let i = 0 ; i < body.mess.length ; i++){
                        let _mess = body.mess[i];
                        if(this._dispatchMessage(_mess.m, _mess.hid, _mess.mseq, _mess.cat)){
                            this._mostFarHistoryMessage = Math.min(this._mostFarHistoryMessage, _mess.cat);
                        }
                    }
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(
                `${URIS['chats.list']}?group=${this.header}&skip=0&limit=${PAGE_SIZE}&fromcat=${this._mostFarHistoryMessage || this._subscribed}`,
                undefined, callbackFn
            );
        });
    }
    post(message, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 9999));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 9999));
            } else if(!message){
                return callback(new GbaseError('Argument message is invalid', 9999));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['chats.message']}?group=${this.header}`, { message }, callbackFn);
        });
    }
    unlisten(){
        this._fetching = false;
        this.historyOfSequenceNumbers = [];
    }

    _fetch(callback){
        var _this = this;

        var _subsc;

        function doFetch(){
            let callbackFn = (err, body) => {
                if(err){
                    console.warn(err);
                } else {
                    _subsc = body.subscribed;
                    for(let i = 0 ; i < body.mess.length ; i++){
                        let _mess = body.mess[i];
                        _this._dispatchMessage(_mess.m, _mess.hid, _mess.mseq, _mess.cat);
                    }
                    tryToLoadHistory();
                }
            };

            _this._gbaseApi._networkManager.sendRequestOutOfQueue(`${URIS['chats.fetch']}?group=${_this.header}`, undefined, callbackFn);
        }
        function tryToLoadHistory(){
            if(_subsc !== -1 && (_this._subscribed == null || _subsc - _this._subscribed < MAX_SUBSCRIBE_GAP_WITHOUT_LOAD_HISTORY_MS)){
                doLoadHistory();
            } else {
                re()
            }
        }
        function doLoadHistory(skip=0){
            let callbackFn = (err, body) => {
                let _decideToFetchNext = true;
                if(err){
                    console.warn(err);
                } else if(_this._fetching){
                    for(let i = 0 ; i < body.mess.length ; i++){
                        let _mess = body.mess[i];
                        if(_this._dispatchMessage(_mess.m, _mess.hid, _mess.mseq, _mess.cat)){
                            _decideToFetchNext = false;
                        }
                    }
                }
                if(_decideToFetchNext){
                    re();
                } else {
                    doLoadHistory(skip + PAGE_SIZE);
                }
            };

            _this._gbaseApi._networkManager.doTheRequest(
                `${URIS['chats.list']}?group=${_this.header}&skip=${skip}&limit=${PAGE_SIZE}&fromcat=${_subsc}`,
                undefined, callbackFn
            );
        }
        function re(){
            if(_this._subscribed !== _subsc && _subsc !== -1){
                _this._subscribed = _subsc;
            }
            if(_this._fetching){
                if(callback){
                    callback(null, new GbaseResponse(true));
                    callback = undefined;
                }
                _this._fetch();
            } else if(callback){
                callback();
                callback = undefined;
            }
        }

        doFetch();
    }
    _dispatchMessage(messageContent, authorHumanId, sequenceNumber, createdAt){
        if(!this.historyOfSequenceNumbers.includes(sequenceNumber)){
            this.historyOfSequenceNumbers.push(sequenceNumber);
            this.emit('message', new ChatMessage(messageContent, authorHumanId, sequenceNumber, createdAt));
            return true;
        } else {
            return false;
        }
    }
}

module.exports = GroupChat;