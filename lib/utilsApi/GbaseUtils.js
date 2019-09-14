'use strict';

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js');

var GbaseConstants = require('../GbaseConstants.js');

var someUtils = require('../utils/someUtils.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP,
    PLATFORMS_MAP = GbaseConstants.PLATFORMS_MAP;

class GbaseUtils {
    /**
     * A section of API holding various utils
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;
    }

    /**
     * A simple method returns local server time. Commonly it's UTC 0.
     *
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    getServerTime(callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 268));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['utils.getServerTime']}`, null, callbackFn);
        });
    }

    /**
     * A simple method returns current session request sequence.
     *
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    getSequence(callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 269));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['utils.getSequence']}`, null, callbackFn);
        });
    }

    /**
     * A simple method to transform server-side timestamp to local considering different timezones
     *
     * @param theTimestamp - self-titled
     *
     * @returns {Number} - transformed timestamp
     */
    serverTimestampToLocal(theTimestamp){
        return theTimestamp - this._gbaseApi.serverTimezone + new Date().getTimezoneOffset() * 60 * 1000;
    }

    /**
     * Not tested, not documented, yet!
     */
    purchaseValidation(theReceipt, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 270));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 271));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 272));
            } else if(this._gbaseApi.platform !== PLATFORMS_MAP.ANDROID && this._gbaseApi.platform !== PLATFORMS_MAP.IOS){
                return callback(new GbaseError('Verify receipts only from mobile devices', 273));
            } else if(typeof theReceipt !== 'object' || Array.isArray(theReceipt)){
                return callback(new GbaseError('Wrong receipt', 274));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['utils.purchaseValidation']}`, { receipt: theReceipt }, callbackFn);
        });
    }
}

module.exports = GbaseUtils;