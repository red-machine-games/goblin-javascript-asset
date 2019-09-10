'use strict';

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js');

var GbaseConstants = require('../GbaseConstants.js');

var someUtils = require('../utils/someUtils.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP;

class GbaseSocial {
    /**
     * A section of API holding mechanism of working with social networks VK.com and OK.ru
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;
    }

    /**
     * Goblin backend can receive in-application purchases through "purchase service callback" that being contacted by VK.com itself.
     * All of them are persisted and you can list them
     *
     * @param skip {Number} - pagination skip
     * @param limit {Number} - pagination limit
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    vkListPurchases(skip=0, limit=20, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 184));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 185));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 186));
            } else if(typeof skip !== 'number' || skip < 0 || isNaN(skip)
                || typeof limit !== 'number' || limit < 1 || limit > 20 || isNaN(limit)){
                return callback(new GbaseError('Arguments are invalid', 187));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['vkJobs.listPurchases']}?offset=${skip}&limit=${limit}`, null, callbackFn);
        });
    }

    /**
     * Mark purchase as consumed. Purchases itself do nothing for player hence you should manage it on client-side.
     * Consume it and make some profile modifications(add gold or crystals). Consuming itself is atomic otherwise you'll
     * get a legit logic error with index 179. Remember that two different requests for consuming and profile modification
     * are not atomic so you need to implement some guarantees.
     *
     * @param purchaseNum {Number} - num of particular purchase you can get from listing
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    vkConsumePurchase(purchaseNum, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 188));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 189));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 286));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 190));
            } else if(typeof purchaseNum !== 'number' || purchaseNum < 0){
                return callback(new GbaseError('Argument "purchaseNum" is invalid', 191));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['vkJobs.consumePurchase']}?purchasenum=${purchaseNum}`, null, callbackFn);
        });
    }

    /**
     * Goblin backend can receive in-application purchases through "purchase service callback" that being contacted by OK.ru itself.
     * All of them are persisted and you can list them
     *
     * @param skip {Number} - pagination skip
     * @param limit {Number} - pagination limit
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    okListPurchases(skip=0, limit=20, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 192));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 193));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 194));
            } else if(typeof skip !== 'number' || skip < 0 || isNaN(skip)
                || typeof limit !== 'number' || limit < 1 || limit > 20 || isNaN(limit)){
                return callback(new GbaseError('Arguments are invalid', 195));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['okJobs.listPurchases']}?offset=${skip}&limit=${limit}`, null, callbackFn);
        });
    }

    /**
     * Mark purchase as consumed. Purchases itself do nothing for player hence you should manage it on client-side.
     * Consume it and make some profile modifications(add gold or crystals). Consuming itself is atomic otherwise you'll
     * get a legit logic error with index 575. Remember that two different requests for consuming and profile modification
     * are not atomic so you need to implement some guarantees.
     *
     * @param purchaseNum {Number} - num of particular purchase you can get from listing
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    okConsumePurchase(purchaseNum, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 196));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 197));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 287));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 198));
            } else if(typeof purchaseNum !== 'number' || purchaseNum < 0){
                return callback(new GbaseError('Argument "purchaseNum" is invalid', 199));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['okJobs.consumePurchase']}?purchasenum=${purchaseNum}`, null, callbackFn);
        });
    }
}

module.exports = GbaseSocial;