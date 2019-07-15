'use strict';

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js');

var GbaseConstants = require('../GbaseConstants.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP;

class GbasePve {
    /**
     * A section of API holding simplified PvE mechanism
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;
    }

    /**
     * Pve is a set of acts programmed with 3 cloud functions: "pveInit", "pveAct" and "pveFinalize". Fist to are called directly
     * from client and the last one is called automatically by decision of "pveAct" cloud function. Possible to pass any params
     * to "pveInit" cloud function.
     *
     * @param beginParams {Object} - any plain object will be accessed on pveInit
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    begin(beginParams, callback=NOOP){
        if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 132));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 133));
        } else if(beginParams != null && typeof beginParams !== 'object'){
            return callback(new GbaseError('Argument beginParams must be an object or nothing', 134));
        }

        let callbackFn = (err, body) => {
            if(err){
                callback(err);
            } else {
                callback(null, new GbaseResponse(true, { originalResponse: body }));
            }
        };

        this._gbaseApi._networkManager.doSendRequest(`${URIS['pve.beginSimple']}`, beginParams, callbackFn);
    }

    /**
     * An action or turn of PvE cycle. Backed with "pveAct" cloud function which can finalize pve cycle and call "pveFinalize"
     * cloud function. The same way some params can be passed.
     *
     * @param actParams {Object} - any plain object will be accessed on pveAct
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    act(actParams, callback=NOOP){
        if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 135));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 136));
        } else if(actParams != null && typeof actParams !== 'object'){
            return callback(new GbaseError('Argument actParams must be an object or nothing', 137));
        }

        let callbackFn = (err, body) => {
            if(err){
                callback(err);
            } else {
                callback(null, new GbaseResponse(true, { originalResponse: body }));
            }
        };

        this._gbaseApi._networkManager.doSendRequest(`${URIS['pve.actSimple']}`, actParams, callbackFn);
    }

    /**
     * Pve cycle will produce battle journal entry. It's made by calling function "appendSelfBattleJournalPve"
     * from cloud function "pveFinalize". It'll contain some details on battle plus schema-less data from cloud code programmer.
     *
     * @param skip {Number} - pagination skip
     * @param limit {Number} - pagination limit
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    listBattles(skip=0, limit=20, callback=NOOP){
        if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 275));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 276));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile before', 277));
        } else if(typeof skip !== 'number' || skip < 0 || isNaN(skip)
            || typeof limit !== 'number' || limit < 1 || limit > 20 || isNaN(limit)){
            return callback(new GbaseError('Arguments are invalid', 278));
        }

        let callbackFn = (err, body) => {
            if(err){
                callback(err);
            } else {
                callback(null, new GbaseResponse(true, { originalResponse: body }));
            }
        };

        this._gbaseApi._networkManager.doSendRequest(`${URIS['pve.listBattles']}`, null, callbackFn);
    }
}

module.exports = GbasePve;