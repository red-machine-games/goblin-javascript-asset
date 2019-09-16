'use strict';

var crc32 = require('crc-32');

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js');

var GbaseConstants = require('../GbaseConstants.js');

var someUtils = require('../utils/someUtils.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP,
    DEFAULT_RECORDS_SEGMENT = GbaseConstants.DEFAULT_RECORDS_SEGMENT;

class GbaseLeaderboards {
    /**
     * A section of API host all leaderboards/records related: getting, setting and updating
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;
    }

    /**
     * Post a record into some segment(segments are white listed at Gbase configurations). All new posts in same segment will overwrite each other.
     *
     * @param value {Number} - positive int
     * @param intoSegment {String} - string, default="def"
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    postRecord(value, intoSegment=DEFAULT_RECORDS_SEGMENT, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 64));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Records direct publish is not allowed (by configuration). It only can be done done with cloud functions', 65));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Records direct modification is not allowed (by configuration). It only can be done done with cloud functions', 282));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 66));
            } else if(typeof value !== 'number' || isNaN(value) || value < -1 || !intoSegment || typeof intoSegment !== 'string'){
                return callback(new GbaseError('Arguments are invalid', 67));
            }

            let callbackFn = err => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: undefined }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['tops.postARecord']}?value=${value}&segment=${intoSegment}`, {}, callbackFn);
        });
    }

    /**
     * Get self record from some segment. Self titled
     *
     * @param fromSegment {String} - string, default="def"
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    getSelfRecord(fromSegment=DEFAULT_RECORDS_SEGMENT, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 68));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 69));
            } else if(!fromSegment || typeof fromSegment !== 'string'){
                return callback(new GbaseError('Argument fromSegment invalid', 70));
            }

            let callbackFn = (err, body) => {
                if(err){
                    if(err.details && err.details.status === 404){
                        callback(null, new GbaseResponse(true, { originalResponse: undefined, originalStatus: 404 }));
                    } else {
                        callback(err);
                    }
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['tops.getPlayerRecord']}?segment=${fromSegment}`, null, callbackFn);
        });
    }

    /**
     * List leaders from some segment. Use arguments "skip" and "limit"(maximum 20) for pagination.
     *
     * @param fromSegment {String} - string, default="def"
     * @param skip {Number} - int, min 0
     * @param limit {Number} - int, min 1 max 20
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    getLeaderboardOverall(fromSegment=DEFAULT_RECORDS_SEGMENT, skip=0, limit=20, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 71));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Records direct access is not allowed (by configuration). It only can be done done with cloud functions', 99));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 72));
            } else if(!fromSegment || typeof fromSegment !== 'string' || typeof skip !== 'number' || skip < 0 || isNaN(skip)
                || typeof limit !== 'number' || limit < 1 || limit > 20 || isNaN(limit)){
                return callback(new GbaseError('Arguments are invalid', 73));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(
                `${URIS['tops.getLeadersOverall']}?segment=${fromSegment}&skip=${skip}&limit=${limit}`,
                null, callbackFn
            );
        });
    }

    /**
     * Remove player's record from some segment
     *
     * @param fromSegment {String} - string, default="def"
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    removeSelfRecord(fromSegment=DEFAULT_RECORDS_SEGMENT, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 74));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Records direct publish is not allowed (by configuration). It only can be done done with cloud functions', 75));
            } else if(this._gbaseApi.disallowDirectProfileExposure){
                return callback(new GbaseError('Records direct modification is not allowed (by configuration). It only can be done done with cloud functions', 283));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 76));
            } else if(!fromSegment || typeof fromSegment !== 'string'){
                return callback(new GbaseError('Argument fromSegment is invalid', 77));
            }

            let callbackFn = err => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: undefined }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['tops.removeRecord']}?segment=${fromSegment}`, null, callbackFn);
        });
    }

    /**
     * Before taking leaders among social friends you need to tell Goblin backend about your friends. It does't use any social SDK to
     * get your friends by itself hence it's on your side.
     *
     * @param friendsArray {Array} - just an array of your friends' IDs
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    refreshVkFriendsCache(friendsArray, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 100));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 101));
            } else if(!friendsArray || !Array.isArray(friendsArray) || !friendsArray.length || friendsArray.length > 10000){
                return callback(new GbaseError('Argument friendsArray is invalid', 102));
            } else if(!this._gbaseApi.currentAccount.vk){
                return callback(new GbaseError('You\'re not a VK player', 103));
            }

            let callbackFn = err => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: undefined }));
                }
            };

            friendsArray = friendsArray.join(',');
            var friendsHash = crc32.str(friendsArray);
            this._gbaseApi._networkManager.doTheRequest(
                `${URIS['tops.refreshVkFriendsCache']}?friendsCrc=${friendsHash}`, { friends: friendsArray },
                callbackFn
            );
        });
    }

    /**
     * Before taking leaders among social friends you need to tell Goblin backend about your friends. It does't use any social SDK to
     * get your friends by itself hence it's on your side.
     *
     * @param friendsArray {Array} - just an array of your friends' IDs
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    refreshOkFriendsCache(friendsArray, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 104));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 105));
            } else if(!friendsArray || !friendsArray.length || friendsArray.length > 10000){
                return callback(new GbaseError('Argument friendsArray is invalid', 106));
            } else if(!this._gbaseApi.currentAccount.ok){
                return callback(new GbaseError('You\'re not an OK player', 107));
            }

            let callbackFn = err => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: undefined }));
                }
            };

            friendsArray = friendsArray.join(',');
            var friendsHash = crc32.str(friendsArray);
            this._gbaseApi._networkManager.doSendRequest(
                `${URIS['tops.refreshOkFriendsCache']}?friendsCrc=${friendsHash}`, { friends: friendsArray },
                callbackFn
            );
        });
    }

    /**
     * Before taking leaders among social friends you need to tell Goblin backend about your friends. It does't use any social SDK to
     * get your friends by itself hence it's on your side.
     *
     * @param friendsArray {Array} - just an array of your friends' IDs
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    refreshFbFriendsCache(friendsArray, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 108));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 109));
            } else if(!friendsArray || !friendsArray.length || friendsArray.length > 10000){
                return callback(new GbaseError('Argument friendsArray is invalid', 110));
            } else if(!this._gbaseApi.currentAccount.fb){
                return callback(new GbaseError('You\'re not a FB player', 111));
            }

            let callbackFn = err => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: undefined }));
                }
            };

            friendsArray = friendsArray.join(',');
            var friendsHash = crc32.str(friendsArray);
            this._gbaseApi._networkManager.doSendRequest(
                `${URIS['tops.refreshFbFriendsCache']}?friendsCrc=${friendsHash}`, { friends: friendsArray },
                callbackFn
            );
        });
    }

    /**
     * To get someone's rating. Just a simple method to retrieve rating by providing existing human-ID.
     *
     * @param targetHumanId {Number} - self titled
     * @param fromSegment {String} - self titled
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    getSomeonesRating(targetHumanId, fromSegment=DEFAULT_RECORDS_SEGMENT, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 112));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Records direct access is not allowed (by configuration). It only can be done done with cloud functions', 115));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 113));
            } else if(!targetHumanId || typeof targetHumanId !== 'number' || targetHumanId < 0 || !fromSegment || typeof fromSegment !== 'string'){
                return callback(new GbaseError('Some arguments are invalid', 114));
            }

            let callbackFn = (err, body) => {
                if(err){
                    if(err.details && err.details.status === 404){
                        callback(null, new GbaseResponse(true, { originalResponse: undefined, originalStatus: 404 }));
                    } else {
                        callback(err);
                    }
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(`${URIS['tops.getSomeonesRating']}?hid=${targetHumanId}&segment=${fromSegment}`, null, callbackFn);
        });
    }

    /**
     * A special method to get leaders only among your social friends. It'll determine your social platform if you logged before.
     * A very need to provide list of your friends first using methods "refresh*FriendsCache". If no friends on Goblin backend you'll get
     * just positive response without any data. A friends cache lives approximately for 1 week(configured on backend). So just try to
     * refresh your friends once a while but not too often.
     *
     * @param fromSegment {String} - self titled
     * @param skip {Number} - pagination skip (from 0 to infinity)
     * @param limit {Number} - pagination limit (from 1 to 20)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    getLeadersWithinFriends(fromSegment=DEFAULT_RECORDS_SEGMENT, skip=0, limit=20, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 116));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Records direct access is not allowed (by configuration). It only can be done done with cloud functions', 117));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile before', 118));
            } else if(!fromSegment || typeof fromSegment !== 'string' || typeof skip !== 'number' || skip < 0 || isNaN(skip)
                || typeof limit !== 'number' || limit < 1 || limit > 20 || isNaN(limit)){
                return callback(new GbaseError('Arguments are invalid', 119));
            } else if(!this._gbaseApi.currentAccount.vk && !this._gbaseApi.currentAccount.ok && !this._gbaseApi.currentAccount.fb){
                return callback(new GbaseError('You\'re not linked with any social profile', 120));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doSendRequest(
                `${URIS['tops.getLeadersWithinFriends']}?segment=${fromSegment}&skip=${skip}&limit=${limit}`, null,
                callbackFn
            );
        });
    }
}

module.exports = GbaseLeaderboards;