'use strict';

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js');

var GbaseConstants = require('../GbaseConstants.js');

var someUtils = require('../utils/someUtils.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP;

class GbaseTickets {
    /**
     * A section of API holding tickets mechanism
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;
    }

    /**
     * Send non-social ticket to some player through providing his human-ID. Ticket is a form of communication which helps you to
     * send some schema-less data to players. Using this feature you can build trading or presents system.
     * Ticket have limited life time configured on backend side.
     *
     * @param receiverHumanId {Number} - self titled
     * @param header {String} - a user-defined header that will be visible for communicating
     * @param payload {Object} - all the data you consider to provide
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    sendTicket(receiverHumanId, header, payload, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 200));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 201));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 288));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 202));
            } else if(typeof receiverHumanId !== 'number' || receiverHumanId < 1 || typeof header !== 'string' || !header
                || !payload || typeof payload !== 'object' || Array.isArray(payload)){
                return callback(new GbaseError('Arguments are invalid', 203));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(
                `${URIS['tickets.sendTicket']}?receiverId=${receiverHumanId}`,
                { ticketHead: header, ticketPayload: payload, ticketCallback: true },
                callbackFn
            );
        });
    }

    /**
     * Send ticket to some player linked with VK.com through providing his VK.com ID. Ticket is a form of communication which helps you to
     * send some schema-less data to players. Using this feature you can build trading or presents system.
     * The ticket will be available for player even if he is not yet linked with VK.com(or if there is no such player yet).
     * After signing up player anyway will receive this ticket.
     * Ticket have limited life time configured on backend side.
     *
     * @param receiverVkId {String} - self titled
     * @param header {String} - a user-defined header that will be visible for communicating
     * @param payload {Object} - all the data you consider to provide
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    sendTicketVk(receiverVkId, header, payload, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 204));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 205));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 289));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 206));
            } else if(!receiverVkId || typeof header !== 'string' || !header || !payload || typeof payload !== 'object' || Array.isArray(payload)){
                return callback(new GbaseError('Arguments are invalid', 207));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(
                `${URIS['tickets.sendTicketVk']}?receiverVk=${receiverVkId}`,
                { ticketHead: header, ticketPayload: payload, ticketCallback: true },
                callbackFn
            );
        });
    }

    /**
     * Send ticket to some player linked with OK.ru through providing his OK.ru ID. Ticket is a form of communication which helps you to
     * send some schema-less data to players. Using this feature you can build trading or presents system.
     * The ticket will be available for player even if he is not yet linked with VK.com(or if there is no such player yet).
     * After signing up player anyway will receive this ticket.
     * Ticket have limited life time configured on backend side.
     *
     * @param receiverOkId {String} - self titled
     * @param header {String} - a user-defined header that will be visible for communicating
     * @param payload {Object} - all the data you consider to provide
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    sendTicketOk(receiverOkId, header, payload, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 208));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 209));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 290));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 210));
            } else if(!receiverOkId || typeof header !== 'string' || !header || !payload || typeof payload !== 'object' || Array.isArray(payload)){
                return callback(new GbaseError('Arguments are invalid', 211));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(
                `${URIS['tickets.sendTicketOk']}?receiverOk=${receiverOkId}`,
                { ticketHead: header, ticketPayload: payload, ticketCallback: true },
                callbackFn
            );
        });
    }

    /**
     * Send ticket to some player linked with Facebook through providing his Facebook ID. Ticket is a form of communication which
     * helps you to send some schema-less data to players. Using this feature you can build trading or presents system.
     * The ticket will be available for player even if he is not yet linked with VK.com(or if there is no such player yet).
     * After signing up player anyway will receive this ticket.
     * Ticket have limited life time configured on backend side.
     *
     * @param receiverFbId {String} - self titled
     * @param header {String} - a user-defined header that will be visible for communicating
     * @param payload {Object} - all the data you consider to provide
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    sendTicketFb(receiverFbId, header, payload, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 212));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 213));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 291));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 214));
            } else if(!receiverFbId || typeof header !== 'string' || !header || !payload || typeof payload !== 'object' || Array.isArray(payload)){
                return callback(new GbaseError('Arguments are invalid', 215));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(
                `${URIS['tickets.sendTicketFb']}?receiverFb=${receiverFbId}`,
                { ticketHead: header, ticketPayload: payload, ticketCallback: true },
                callbackFn
            );
        });
    }

    /**
     * You can list your sended tickets with all useful information like ticket ID (tid), data and recipient's reaction on it.
     *
     * @param skip {Number} - pagination skip
     * @param limit {Number} - pagination limit
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    listSendedTickets(skip=0, limit=20, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 216));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 217));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 292));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 218));
            } else if(typeof skip !== 'number' || skip < 0 || isNaN(skip)
                || typeof limit !== 'number' || limit < 1 || limit > 20 || isNaN(limit)){
                return callback(new GbaseError('Arguments are invalid', 219));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.listSendedTickets']}?skip=${skip}&limit=${limit}`, null, callbackFn);
        });
    }

    /**
     * You can list your inbox of tickets with all useful information.
     *
     * @param skip {Number} - pagination skip
     * @param limit {Number} - pagination limit
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    listReceivedTickets(skip=0, limit=20, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 220));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 221));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 293));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 222));
            } else if(typeof skip !== 'number' || skip < 0 || isNaN(skip)
                || typeof limit !== 'number' || limit < 1 || limit > 20 || isNaN(limit)){
                return callback(new GbaseError('Arguments are invalid', 223));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.listReceivedTickets']}?skip=${skip}&limit=${limit}`, null, callbackFn);
        });
    }

    /**
     * A conditional action of confirming non-social ticket. It will do nothing special to interlocutors but you can base your
     * domain logic on this confirm/reject reaction.
     * A ticket will be marked as confirmed on backend and both participants will see it.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    confirmTicket(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 224));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 225));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 294));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 226));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 227));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.confirmTicket']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * A conditional action of confirming VK.com ticket. It will do nothing special to interlocutors but you can base your
     * domain logic on this confirm/reject reaction.
     * A ticket will be marked as confirmed on backend and both participants will see it.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    confirmTicketVk(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 228));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 229));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 295));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 230));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 231));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.confirmTicketVk']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * A conditional action of confirming OK.ru ticket. It will do nothing special to interlocutors but you can base your
     * domain logic on this confirm/reject reaction.
     * A ticket will be marked as confirmed on backend and both participants will see it.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    confirmTicketOk(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 232));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 233));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 296));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 234));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 235));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.confirmTicketOk']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * A conditional action of confirming Facebook ticket. It will do nothing special to interlocutors but you can base your
     * domain logic on this confirm/reject reaction.
     * A ticket will be marked as confirmed on backend and both participants will see it.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    confirmTicketFb(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 236));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 237));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 297));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 238));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 239));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.confirmTicketFb']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * A conditional action of rejecting non-social ticket. It will do nothing special to interlocutors but you can base your
     * domain logic on this confirm/reject reaction.
     * A ticket will be marked as rejected on backend and both participants will see it.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    rejectTicket(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 240));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 241));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 298));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 242));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 243));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.rejectTicket']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * A conditional action of rejecting VK.com ticket. It will do nothing special to interlocutors but you can base your
     * domain logic on this confirm/reject reaction.
     * A ticket will be marked as rejected on backend and both participants will see it.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    rejectTicketVk(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 244));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 245));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 299));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 246));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 247));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.rejectTicketVk']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * A conditional action of rejecting OK.ru ticket. It will do nothing special to interlocutors but you can base your
     * domain logic on this confirm/reject reaction.
     * A ticket will be marked as rejected on backend and both participants will see it.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    rejectTicketOk(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 248));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 249));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 300));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 250));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 251));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.rejectTicketOk']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * A conditional action of rejecting Facebook ticket. It will do nothing special to interlocutors but you can base your
     * domain logic on this confirm/reject reaction.
     * A ticket will be marked as rejected on backend and both participants will see it.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    rejectTicketFb(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 252));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 253));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 301));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 254));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 255));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.rejectTicketFb']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * Sender can discharge ticket - basically cancel it while it is not confirmed or rejected.
     * Be ready to get a logic error with index 266 - it means that no ticket meets requirements, it was confirmed or rejected,
     * been discharged previously or just unknown ticket ID.
     * Ticket will be removed immediately.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    dischargeTicket(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 256));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 257));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 302));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 258));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 259));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.dischargeTicket']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * Sender to close rejected ticket. No affect on player data unless you'll implement it by yourself.
     * Be ready to get a logic error with index 271 - it means that no ticket meets requirements, it was not rejected,
     * been dismissed previously or just unknown ticket ID.
     * Ticket will be removed immediately.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    dismissTicket(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 260));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 261));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 303));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 262));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 263));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.dismissTicket']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }

    /**
     * Sender to close confirmed ticket. No affect on player data unless you'll implement it by yourself.
     * Be ready to get a logic error with index 276 - it means that no ticket meets requirements, it was not confirmed,
     * been released previously or just unknown ticket ID.
     * Ticket will be removed immediately.
     *
     * @param ticketId {Number} - you can receive this parameter on callback for sending and on listing("tid" node)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    releaseTicket(ticketId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 264));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 265));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 304));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 266));
            } else if(typeof ticketId !== 'number' || ticketId < 0 || isNaN(ticketId) || ticketId < 1){
                return callback(new GbaseError('Argument "ticketId" is invalid', 267));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tickets.releaseTicket']}?ticketId=${ticketId}`, null, callbackFn);
        });
    }
}

module.exports = GbaseTickets;