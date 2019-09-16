'use strict';

var EventEmitter = require('eventemitter3');

var NetworkManager = require('./NetworkManager.js'),
    GbaseError = require('./objects/GbaseError.js'),
    GbaseResponse = require('./objects/GbaseResponse.js');

var GbaseConstants = require('./GbaseConstants.js');

var someUtils = require('./utils/someUtils.js');

const ROOT_DOMAIN = GbaseConstants.ROOT_DOMAIN,
    PLATFORMS_MAP = GbaseConstants.PLATFORMS_MAP,
    MATCHMAKING_STRATEGIES_MAP = GbaseConstants.MATCHMAKING_STRATEGIES_MAP,
    URI_PREFIX = GbaseConstants.URI_PREFIX,
    URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP;

class GbaseApi extends EventEmitter{
    static get PLATFORM(){ return PLATFORMS_MAP };
    static get MATCHMAKING_STRATEGIES(){ return MATCHMAKING_STRATEGIES_MAP; };

    /**
     * La constructor. Every instance of this class holds it's own instance of NetworkManager with
     * corresponding sequence, unicorn and sign up stuff.
     *
     * @param projectName - your project name like {abbreviated company name}-{abbreviated app name}
     * @param projectEnvironment - it's common practice to use any of these three: dev, qa or production
     * @param hmacSecret - a key for connection. Used for signing all messages. All platforms has different secrets. Also they can change between versions. You can get it by contacting us
     * @param platform - can see all available platforms using GbaseApi.PLATFORM;
     * @param semVersion - semantic version of current client build
     * @param _overrideUrlAddress - you can use it to specially override address. But usually you won't have to
     */
    constructor(projectName, projectEnvironment, hmacSecret, platform, semVersion, _overrideUrlAddress){
        super();
        this._platform = platform;
        this._version = semVersion;
        this._hmacSecret = hmacSecret;
        this._networkManager = new NetworkManager(
            _overrideUrlAddress || `https://${projectName}-${projectEnvironment}${ROOT_DOMAIN}`,
            hmacSecret, platform, semVersion, URIS['utils.ping']
        );
        this._networkManager.on('pingfail', () => this.emit('afk'));

        this.currentUnicorn = undefined;
        this.currentAccount = undefined;
        this.currentProfile = undefined;

        this.serverTimezone = 0;

        this.disallowDirectAllExposure = false;
        this.disallowDirectProfileExposure = false;
        this.disallowDirectPvpMatchmakingExposure = false;
        this.disallowDirectChatAndGroupsExposure = false;

        var GbaseAccounts = require('./accountsAndProfiles/GbaseAccounts.js'),
            GbaseProfiles = require('./accountsAndProfiles/GbaseProfiles.js'),
            GbaseLeaderboards = require('./leaderboard/GbaseLeaderboards.js'),
            GbaseMatchmaking = require('./matchmaking/GbaseMatchmaking.js'),
            GbaseSocial = require('./social/GbasesSocial.js'),
            GbaseTickets = require('./tickets/GbaseTickets.js'),
            GbaseUtils = require('./utilsApi/GbaseUtils.js'),
            GbasePve = require('./pve/GbasePve.js'),
            GbasePvpApi = require('./pvp/GbasePvpApi.js');

        this.account = new GbaseAccounts(this);
        this.profile = new GbaseProfiles(this);
        this.leaderboards = new GbaseLeaderboards(this);
        this.matchmaking = new GbaseMatchmaking(this);
        this.social = new GbaseSocial(this);
        this.tickets = new GbaseTickets(this);
        this.utils = new GbaseUtils(this);
        this.pve = new GbasePve(this);
        this.pvp = new GbasePvpApi(this);
    }

    /**
     * A very important method. You should call it once any of user input happen. Gbase sessions are tend to rot hence
     * API client configured to ping it once a while but it will stop after some time if no user input been done. So do call.
     *
     */
    userInputBeenDone(){
        this._networkManager.someInputBeenDone();
    }

    /**
     * This asset uses a cache engine to store Gbase credentials automatically. Use this method to force clear the cache.
     *
     */
    static dropCache(){
        require('store').clearAll();
    }

    /**
     * Call a defined cloud function. It's a special guys that allows you to run domain logic on backend side - an authoritarian logic.
     *
     * @param functionName - string
     * @param argumentsToTransfer - any object
     * @param callback - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    cloudFunction(functionName, argumentsToTransfer, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 78));
            } else if(!this.currentProfile){
                return callback(new GbaseError('You need to get profile before', 79));
            } else if(!functionName || typeof functionName !== 'string'){
                return callback(new GbaseError('Function name is invalid', 80));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            if(argumentsToTransfer && typeof argumentsToTransfer === 'object' && (Array.isArray(argumentsToTransfer) ? argumentsToTransfer.length : Object.keys(argumentsToTransfer).length)){
                this._networkManager.doTheRequest(`${URI_PREFIX}/act.${functionName}`, argumentsToTransfer, callbackFn);
            } else {
                this._networkManager.doTheRequest(`${URI_PREFIX}/act.${functionName}`, null, callbackFn);
            }
        });
    }
}

module.exports = GbaseApi;