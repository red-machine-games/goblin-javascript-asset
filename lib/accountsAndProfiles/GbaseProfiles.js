'use strict';

var objectPath = require('object-path');

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js');

var GbaseConstants = require('../GbaseConstants.js');

var someUtils = require('../utils/someUtils.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP;

class GbaseProfiles {
    /**
     * A section of API host all profiles related: getting, setting and updating
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;

        this._iAmBadCoder = true;
    }

    get currentProfile(){
        return this._gbaseApi.currentProfile;
    }

    /**
     * After first signing up, in or authentication you need a profile. You can't do anything without profile so create.
     * It has several root nodes: Object profileData, Object publicProfileData, int rating, int mmr, int wlRate, int ver and humanId.
     * You can modify them later except humanId.
     *
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    create(callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 46));
            } else if(this._gbaseApi.currentProfile){
                return callback(new GbaseError('You already have profile', 47));
            } else if(this._gbaseApi.currentAccount && this._gbaseApi.currentAccount.haveProfile){
                return callback(new GbaseError('This account already have profile', 48));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    this._gbaseApi.currentProfile = body;
                    this._gbaseApi.currentAccount.haveProfile = true;
                    if(body.disallowDirectAllExposure){
                        this._gbaseApi.disallowDirectAllExposure = true;
                    }
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(URIS['profile.createProfile'], null, callbackFn);
        });
    }

    /**
     * Just get your profile after login. It's a necessary action. You DON'T need to get profile after creation.
     * Profile is accessible from "currentProfile" property
     *
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    getp(callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 49));
            } else if(this._gbaseApi.currentAccount && !this._gbaseApi.currentAccount.haveProfile){
                return callback(new GbaseError('This account does not have profile. Should create one', 50));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    this._gbaseApi.currentProfile = body;
                    if(body.disallowDirectAllExposure){
                        this._gbaseApi.disallowDirectAllExposure = true;
                    }
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(URIS['profile.getProfile'], null, callbackFn);
        });
    }

    /**
     * Fully set(rewrite) one or more root nodes. Not that I will poke you if you'll use this method more than once!
     *
     * @param profileData {Object} - a schema less object representing main profile data
     * @param publicProfileData {Object} - a schema less public part -  only part that available for discovery by other players
     * @param rating {Number} - int used for matchmaking
     * @param mmr {Number} - int used for matchmaking
     * @param wlRate {Number} - int used for matchmaking
     * @param ver {Number} - int representing version of particular profile. Once a while client will update and you'll need to mutate profile as far. "ver" property will help not to lost
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    setp(profileData, publicProfileData, rating, mmr, wlRate, ver, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 51));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Profile direct modification is not allowed (by configuration). It only can be done done with cloud functions', 52));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Profile direct modification is not allowed (by configuration). It only can be done done with cloud functions', 284));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before setting', 53));
            } else if(!this._iAmBadCoder){
                return callback(new GbaseError('Using setProfile profile frequently is very bad practice that can lead to inefficient networking etc. Use updateProfile instead - be a good coder!', 666));
            }

            let callbackFn = err => {
                if(err){
                    callback(err);
                } else {
                    if(toSet.profileData){
                        this._gbaseApi.currentProfile.profileData = toSet.profileData;
                    }
                    if(toSet.publicProfileData){
                        this._gbaseApi.currentProfile.publicProfileData = toSet.publicProfileData;
                    }
                    if(toSet.rating){
                        this._gbaseApi.currentProfile.rating = toSet.rating;
                    }
                    if(toSet.mmr){
                        this._gbaseApi.currentProfile.mmr = toSet.mmr;
                    }
                    if(toSet.wlRate){
                        this._gbaseApi.currentProfile.wlRate = toSet.wlRate;
                    }
                    if(toSet.ver){
                        this._gbaseApi.currentProfile.ver = toSet.ver;
                    }
                    this._iAmBadCoder = false;
                    callback(null, new GbaseResponse(true, { originalResponse: undefined }));
                }
            };

            var toSet = {};
            if(profileData && typeof profileData === 'object'){
                toSet.profileData = profileData;
            }
            if(publicProfileData && typeof publicProfileData === 'object'){
                toSet.publicProfileData = publicProfileData;
            }
            if(typeof rating === 'number' && !isNaN(rating)){
                toSet.rating = rating;
            }
            if(typeof mmr === 'number' && !isNaN(mmr)){
                toSet.mmr = mmr;
            }
            if(typeof wlRate === 'number' && !isNaN(wlRate)){
                toSet.wlRate = wlRate;
            }
            if(typeof ver === 'number' && !isNaN(ver)){
                toSet.ver = ver;
            }
            if(Object.keys(toSet).length){
                this._gbaseApi._networkManager.doTheRequest(URIS['profile.setProfile'], toSet, callbackFn);
            } else {
                callback(new GbaseError('All arguments are null - nothing to set', 54));
            }
        });
    }

    /**
     * More tolerated method for keeping data in profile. "publicData" and "publicProfileData" should be presented as 1-level key-value map where
     * key is path(separated with dots) and value is the value. It will not fully rewrite root nodes but just change some according to these keys.
     * Arguments "rating", "mmr", "wlRate" and "ver" mods the same way.
     *
     * @param profileData {Object} - a schema less object representing main profile data
     * @param publicProfileData {Object} - a schema less public part -  only part that available for discovery by other players
     * @param rating {Number} - int used for matchmaking
     * @param mmr {Number} - int used for matchmaking
     * @param wlRate {Number} - int used for matchmaking
     * @param ver {Number} - int representing version of particular profile. Once a while client will update and you'll need to mutate profile as far. "ver" property will help not to lost
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    update(profileData, publicProfileData, rating, mmr, wlRate, ver, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 55));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Profile direct modification is not allowed (by configuration). It only can be done done with cloud functions', 56));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Profile direct modification is not allowed (by configuration). It only can be done done with cloud functions', 285));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before setting', 57));
            }

            let callbackFn = err => {
                if(err){
                    callback(err);
                } else {
                    if(toUpdate.profileData){
                        for(let k in toUpdate.profileData){
                            if(toUpdate.profileData.hasOwnProperty(k)){
                                objectPath.set(this._gbaseApi.currentProfile.profileData, k, toUpdate.profileData[k]);
                            }
                        }
                    }
                    if(toUpdate.publicProfileData){
                        for(let k in toUpdate.publicProfileData){
                            if(toUpdate.publicProfileData.hasOwnProperty(k)){
                                objectPath.set(this._gbaseApi.currentProfile.publicProfileData, k, toUpdate.publicProfileData[k]);
                            }
                        }
                    }
                    if(toUpdate.rating){
                        this._gbaseApi.currentProfile.rating = toUpdate.rating;
                    }
                    if(toUpdate.mmr){
                        this._gbaseApi.currentProfile.mmr = toUpdate.mmr;
                    }
                    if(toUpdate.wlRate){
                        this._gbaseApi.currentProfile.wlRate = toUpdate.wlRate;
                    }
                    if(toUpdate.ver){
                        this._gbaseApi.currentProfile.ver = toUpdate.ver;
                    }
                    callback(null, new GbaseResponse(true, { originalResponse: undefined }));
                }
            };

            var toUpdate = {};
            if(profileData && typeof profileData === 'object'){
                if(Array.isArray(profileData)){
                    return callback(new GbaseError('Argument profileData should be an object with keys and values', 58));
                } else {
                    toUpdate.profileData = profileData;
                }
            }
            if(publicProfileData && typeof publicProfileData === 'object'){
                if(Array.isArray(publicProfileData)){
                    return callback(new GbaseError('Argument publicProfileData should be an object with keys and values', 59));
                } else {
                    toUpdate.publicProfileData = publicProfileData;
                }
            }
            if(typeof rating === 'number' && !isNaN(rating)){
                toUpdate.rating = rating;
            }
            if(typeof mmr === 'number' && !isNaN(mmr)){
                toUpdate.mmr = mmr;
            }
            if(typeof wlRate === 'number' && !isNaN(wlRate)){
                toUpdate.wlRate = wlRate;
            }
            if(typeof ver === 'number' && !isNaN(ver)){
                toUpdate.ver = ver;
            }
            if(Object.keys(toUpdate).length){
                this._gbaseApi._networkManager.doTheRequest(URIS['profile.updateProfile'], toUpdate, callbackFn);
            } else {
                callback(new GbaseError('All arguments are null or invalid - nothing to update', 60));
            }
        });
    }

    /**
     * Just get someone's publicProfileData
     *
     * @param targetHumanId {Number} - self titled
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    getPublic(targetHumanId, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 61));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile first', 62));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 131));
            } else if(!targetHumanId || typeof targetHumanId !== 'number' || targetHumanId < 1 || isNaN(targetHumanId)){
                return callback(new GbaseError('Argument targetHumanId invalid or empty - needed', 63));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['profile.getPublicProfile']}?hid=${targetHumanId}`, null, callbackFn);
        });
    }
}

module.exports = GbaseProfiles;