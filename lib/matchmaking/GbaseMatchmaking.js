'use strict';

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js'),
    GbaseRangePicker = require('../objects/GbaseRangePicker.js');

var GbaseConstants = require('../GbaseConstants.js');

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
     * @param ranges {GbaseRangePicker} - an instance with ranges of search. See test examples
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     */
    matchPlayer(fromSegment=DEFAULT_RECORDS_SEGMENT, strategy, ranges, callback=NOOP){
        if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 121));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 122));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 123));
        } else if(!fromSegment || typeof fromSegment !== 'string'){
            return callback(new GbaseError('Argument fromSegment is invalid', 124));
        } else if(!Object.values(MATCHMAKING_STRATEGIES_MAP).includes(strategy)){
            return callback(new GbaseError('Argument strategy is invalid', 125));
        } else if(!ranges || !(ranges instanceof GbaseRangePicker) || !ranges.rgs.length){
            return callback(new GbaseError('Argument ranges is invalid', 126));
        }

        let callbackFn = (err, body) => {
            if(err){
                callback(err);
            } else {
                callback(null, new GbaseResponse(true, { originalResponse: body }));
            }
        };

        this._gbaseApi._networkManager.doSendRequest(`${URIS['mm.matchPlayer']}?segment=${fromSegment}&strat=${strategy}`, ranges, callbackFn);
    }

    /**
     * Not tested not documented yet
     */
    matchBot(ranges, callback=NOOP){
        if(!this._gbaseApi.currentUnicorn){
            return callback(new GbaseError('You need to auth first', 127));
        } else if(this._gbaseApi.disallowDirectProfileExposure){
            return callback(new GbaseError('Direct access is not allowed (by configuration). It\'s only can be done with cloud functions', 128));
        } else if(!this._gbaseApi.currentProfile){
            return callback(new GbaseError('You need to get profile first', 129));
        } else if(!ranges || !(ranges instanceof GbaseRangePicker) || !ranges.rng.length){
            return callback(new GbaseError('Argument ranges is invalid', 130));
        }

        let callbackFn = (err, body) => {
            if(err){
                callback(err);
            } else {
                callback(null, new GbaseResponse(true, { originalResponse: body }));
            }
        };

        this._gbaseApi._networkManager.doSendRequest(`${URIS['mm.matchBot']}?strat=${MATCHMAKING_STRATEGIES_MAP.BY_RATING}`, ranges, callbackFn);
    }
}

module.exports = GbaseMatchmaking;