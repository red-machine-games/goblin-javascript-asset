'use strict';

var GroupChat = require('./GroupChat.js');

var GbaseError = require('../objects/GbaseError.js');

class GbaseTickets {
    /**
     * A section of API holding chats mechanism
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;
    }

    /**
     * Creates new chat group abstract object represented as GroupChat class instance. This class emits "message" event
     * once new message or old message appears. It doesn't store messages after emit so you have to manage it by your self
     * and sort them by sequence number.
     *
     * @param header {String} - a user-defined header that will be visible for communicating
     *
     * @returns {GroupChat} - returns promise if no callback provided
     */
    enterChatGroup(header){
        if(!this._gbaseApi.currentUnicorn){
            throw new GbaseError('You need to auth first', 316);
        } else if(!this._gbaseApi.currentProfile){
            throw new GbaseError('You need to get profile before', 317);
        } else if(!header){
            throw new GbaseError('Argument header is invalid', 318);
        }

        return new GroupChat(header, this._gbaseApi);
    }
}

module.exports = GbaseTickets;