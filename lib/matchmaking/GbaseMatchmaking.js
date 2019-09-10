'use strict';

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js'),
    GbaseRangePicker = require('../objects/GbaseRangePicker.js');

var GbaseConstants = require('../GbaseConstants.js');

var someUtils = require('../utils/someUtils.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP,
    DEFAULT_RECORDS_SEGMENT = GbaseConstants.DEFAULT_RECORDS_SEGMENT,
    MATCHMAKING_STRATEGIES_MAP = GbaseConstants.MATCHMAKING_STRATEGIES_MAP;

class GbaseMatchmaking {
    /**
     * A section of API holding matchmaking as a simple search without actual play
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;
    }

    /**
     * Matchmaking - is a mechanism to pick some player to do the work with. Mostly to play with but you can interpret it as a search.
     * Searching done by rating, picking the appropriate opponent by some rating value from some segment. All the data is up to you.
     * In return you will get the Human-ID
     *
     * @param fromSegment {String} - self titled
     * @param strategy {String} - if backend is configured to receive client-defined strategy, you can pick one from two available: GbaseApi.MATCHMAKING_STRATEGIES.BY_RATING and GbaseApi.MATCHMAKING_STRATEGIES.BY_LADDER
     * @param rangesOrDetails {GbaseRangePicker || Object} - an instance with ranges of search. See test examples. Or any data to transfer if matchmaking is authoritarian
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    matchPlayer(fromSegment=DEFAULT_RECORDS_SEGMENT, strategy, rangesOrDetails, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 121));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 122));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile first', 123));
            } else if(!this._gbaseApi.disallowDirectPvpMatchmakingExposure){
                if(!fromSegment || typeof fromSegment !== 'string'){
                    return callback(new GbaseError('Argument fromSegment is invalid', 124));
                } else if(!Object.values(MATCHMAKING_STRATEGIES_MAP).includes(strategy)){
                    return callback(new GbaseError('Argument strategy is invalid', 125));
                } else if(!rangesOrDetails || !(rangesOrDetails instanceof GbaseRangePicker) || !rangesOrDetails.rgs.length){
                    return callback(new GbaseError('Argument ranges is invalid', 126));
                }
            } else {
                rangesOrDetails = rangesOrDetails || {};
                fromSegment = fromSegment || DEFAULT_RECORDS_SEGMENT;
                if(fromSegment && typeof fromSegment !== 'string'){
                    return callback(new GbaseError('Argument fromSegment is invalid', 305));
                }
                if(!strategy || typeof strategy !== 'string'){
                    return callback(new GbaseError('Argument strategy is invalid', 306));
                }
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['mm.matchPlayer']}?segment=${fromSegment}&strat=${strategy}`, rangesOrDetails, callbackFn);
        });
    }

    /**
     * Not tested not documented yet
     */
    matchBot(rangesOrDetails, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 127));
            } else if(this._gbaseApi.disallowDirectAllExposure){
                return callback(new GbaseError('Direct access is not allowed (by configuration). It only can be done done with cloud functions', 128));
            } else if(!this._gbaseApi.currentProfile){
                return callback(new GbaseError('You need to get profile first', 129));
            } else if(!this._gbaseApi.disallowDirectPvpMatchmakingExposure){
                if(!rangesOrDetails || !(rangesOrDetails instanceof GbaseRangePicker) || !rangesOrDetails.rng.length){
                    return callback(new GbaseError('Argument ranges is invalid', 130));
                }
            } else {
                rangesOrDetails = rangesOrDetails || {};
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['mm.matchBot']}?strat=${MATCHMAKING_STRATEGIES_MAP.BY_RATING}`, rangesOrDetails, callbackFn);
        });
    }
}

module.exports = GbaseMatchmaking;