'use strict';

var store = require('store');

var GbaseError = require('../objects/GbaseError.js'),
    GbaseResponse = require('../objects/GbaseResponse.js'),
    GbaseAccount = require('../objects/GbaseAccount.js');

var GbaseConstants = require('../GbaseConstants.js');

var someUtils = require('../utils/someUtils.js');

const URIS = GbaseConstants.URIS,
    NOOP = GbaseConstants.NOOP,
    G_CLIENT_SECRET_REGEXP = GbaseConstants.G_CLIENT_SECRET_REGEXP,
    G_CLIENT_ID_REGEXP = GbaseConstants.G_CLIENT_ID_REGEXP,
    PLATFORMS_MAP = GbaseConstants.PLATFORMS_MAP;

class GbaseAccounts {
    /**
     * A section of API holds all account related actions: authentication, linking and checking
     *
     */
    constructor(gbaseApi){
        this._gbaseApi = gbaseApi;
        
        this._authInProgressOrDone = false;
        this._reauthLambda = undefined;
    }
    _dropAuth(){
        this._authInProgressOrDone = false;
        this._gbaseApi.currentUnicorn = undefined;
        this._gbaseApi.currentAccount = undefined;
        this._gbaseApi.currentProfile = undefined;
        this._gbaseApi.disallowDirectProfileExposure = false;
        this._gbaseApi._networkManager.dropSession();
    }

    get currentUnicorn(){
        return this._gbaseApi.currentUnicorn;
    }
    get currentAccount(){
        return this._gbaseApi.currentAccount;
    }

    /**
     * Anonymous signing up. You will get gClientId and gClientSecret in response - save it and use for further signing ins.
     *
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    signupGbaseAnon(callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(this._authInProgressOrDone){
                return callback(new GbaseError('Already authenticated or in progress', 12));
            }

            let callbackFn = (err, body) => {
                if(err){
                    this._authInProgressOrDone = false;
                    callback(err);
                } else if(body.unicorn){
                    this._gbaseApi.currentUnicorn = body.unicorn;
                    if(body.authoritarian){
                        this._gbaseApi.disallowDirectProfileExposure = body.authoritarian.profiles;
                        this._gbaseApi.disallowDirectPvpMatchmakingExposure = body.authoritarian.matchmaking;
                        this._gbaseApi.disallowDirectChatAndGroupsExposure = body.authoritarian.chatAndGroups;
                    }
                    this._gbaseApi.currentAccount = new GbaseAccount(body.fb, body.vk, body.ok, body.gClientId, body.gClientSecret, body.prof);
                    this._reauthLambda = cb => this.signinGbase(body.gClientId, body.gClientSecret, cb);
                    store.set('gClientId', body.gClientId);
                    store.set('gClientSecret', body.gClientSecret);
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong - no unicorn. Check original response body', 27));
                }
            };

            this._authInProgressOrDone = true;
            this._gbaseApi._networkManager.doTheRequest(URIS['accounts.getAccount'], {}, callbackFn);
        });
    }

    /**
     * Signing up similar to anonymous but you provide login and password by your self.
     *
     * @param gbaseLogin {String} - an alternative to gClientId. It should match G_CLIENT_ID_REGEXP
     * @param gbasePassword {String} - an alternative to gClientSecret. It should match G_CLIENT_SECRET_REGEXP
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    signupGbaseCustomCredentials(gbaseLogin, gbasePassword, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(this._authInProgressOrDone){
                return callback(new GbaseError('Already authenticated or in progress', 13));
            } else if(!gbaseLogin || !gbasePassword){
                return callback(new GbaseError('Some arguments are empty. Recheck', 14));
            } else if(!G_CLIENT_ID_REGEXP.test(gbaseLogin) || !G_CLIENT_SECRET_REGEXP.test(gbasePassword)){
                return callback(new GbaseError('Credentials has inappropriate format', 81, { G_CLIENT_ID_REGEXP, G_CLIENT_SECRET_REGEXP }));
            }

            let callbackFn = (err, body) => {
                if(err){
                    this._authInProgressOrDone = false;
                    callback(err);
                } else if(body.unicorn){
                    this._gbaseApi.currentUnicorn = body.unicorn;
                    this._gbaseApi.currentAccount = new GbaseAccount(body.fb, body.vk, body.ok, body.gClientId, body.gClientSecret, body.prof);
                    this._reauthLambda = cb => this.signinGbase(gbaseLogin, gbasePassword, cb);
                    store.set('gClientId', gbaseLogin);
                    store.set('gClientSecret', gbasePassword);
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong - no unicorn. Check original response body', 28));
                }
            };

            this._authInProgressOrDone = true;
            this._gbaseApi._networkManager.doTheRequest(
                `${URIS['accounts.getAccount']}?gcustomid=${gbaseLogin}&gcustomsecret=${gbasePassword}`, {},
                callbackFn
            );
        });
    }

    /**
     * Signing in using your login and password or previously received gClientId and gClientSecret. After that you only get
     * session unicorn and account info. To work with API you need to create or get your profile.
     *
     * @param gbaseIdOrLogin {String} - self titled
     * @param gbaseSecretOrPassword {String} - self titled
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    signinGbase(gbaseIdOrLogin, gbaseSecretOrPassword, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(this._authInProgressOrDone){
                return callback(new GbaseError('Already authenticated or in progress', 15));
            } else if(!gbaseIdOrLogin || !gbaseSecretOrPassword){
                return callback(new GbaseError('Some arguments are empty. Recheck', 16));
            }
            if(!gbaseIdOrLogin || !gbaseSecretOrPassword){
                gbaseIdOrLogin = store.get('gClientId');
                gbaseSecretOrPassword = store.get('gClientSecret');
                if(!gbaseIdOrLogin || !gbaseSecretOrPassword){
                    return callback(new GbaseError('Gbase credentials cache is empty, other not provided', 281));
                }
            }

            let callbackFn = (err, body) => {
                if(err){
                    this._authInProgressOrDone = false;
                    callback(err);
                } else if(body.unicorn){
                    this._gbaseApi.currentUnicorn = body.unicorn;
                    this._gbaseApi.currentAccount = new GbaseAccount(body.fb, body.vk, body.ok, body.gClientId, body.gClientSecret, body.prof);
                    this._reauthLambda = cb => this.signinGbase(gbaseIdOrLogin, gbaseSecretOrPassword, cb);
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong - no unicorn. Check original response body', 29));
                }
            };

            this._authInProgressOrDone = true;
            this._gbaseApi._networkManager.doTheRequest(
                `${URIS['accounts.getAccount']}?gclientid=${gbaseIdOrLogin}&gclientsecret=${gbaseSecretOrPassword}`, {},
                callbackFn
            );
        });
    }

    /**
     * Use this authentication method if you use WEBVK platform and your game published inside of VK.com iframe. You will get
     * needed arguments from it to successfully prove your identity.
     *
     * @param vkId {String} - an ID provided by VK.com website
     * @param vkSecret {String} - a secret generated by VK.com website(find out more in VK.com documentation)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    authWebVk(vkId, vkSecret, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(this._gbaseApi._platform !== PLATFORMS_MAP.WEBVK){
                return callback(new GbaseError('Vk web auth available only for WEBVK platform', 17));
            } else if(!vkId || !vkSecret){
                return callback(new GbaseError('Vk id and secret are necessary', 18));
            } else if(this._authInProgressOrDone){
                return callback(new GbaseError('Already authenticated or in progress', 19));
            }

            let callbackFn = (err, body) => {
                if(err){
                    this._authInProgressOrDone = false;
                    callback(err);
                } else if(body.unicorn){
                    this._gbaseApi.currentUnicorn = body.unicorn;
                    this._gbaseApi.currentAccount = new GbaseAccount(body.fb, body.vk, body.ok, body.gClientId, body.gClientSecret, body.prof);
                    this._reauthLambda = cb => this.authWebVk(vkId, vkSecret, cb);
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong - no unicorn. Check original response body', 30));
                }
            };

            this._authInProgressOrDone = true;
            this._gbaseApi._networkManager.doTheRequest(`${URIS['accounts.getAccount']}?vkid=${vkId}&vksecret=${vkSecret}`, {}, callbackFn);
        });
    }

    /**
     * You can still use VK.com services for authentication if you making standalone or mobile app. SDK is provided and you can
     * use it to redeem a token. Provide this token here and Gbase backend will check it on its side.
     *
     * @param tokenFromVk {String} - self titled
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    authVkSdk(tokenFromVk, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!tokenFromVk){
                return callback(new GbaseError('Vk token is necessary', 20));
            } else if(this._authInProgressOrDone){
                return callback(new GbaseError('Already authenticated or in progress', 21));
            }

            let callbackFn = (err, body) => {
                if(err){
                    this._authInProgressOrDone = false;
                    callback(err);
                } else if(body.unicorn){
                    this._gbaseApi.currentUnicorn = body.unicorn;
                    this._gbaseApi.currentAccount = new GbaseAccount(body.fb, body.vk, body.ok, body.gClientId, body.gClientSecret, body.prof);
                    this._reauthLambda = cb => this.authVkSdk(tokenFromVk, cb);
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong - no unicorn. Check original response body', 31));
                }
            };

            this._authInProgressOrDone = true;
            this._gbaseApi._networkManager.doTheRequest(`${URIS['accounts.getAccount']}?vktoken=${tokenFromVk}`, {}, callbackFn);
        });
    }

    /**
     * Use this authentication method if you use WEBOK platform and your game published inside of OK.ru iframe. You will get
     * needed arguments from it to successfully prove your identity.
     *
     * @param okId {String} - an ID provided by OK.ru website
     * @param okSecret {String} - a secret generated by OK.ru website(find out more in OK.ru documentation)
     * @param okSessionKey {String} - a key generated by OK.ru website(find out more in OK.ru documentation)
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    authWebOk(okId, okSecret, okSessionKey, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(this._gbaseApi._platform !== PLATFORMS_MAP.WEBOK){
                return callback(new GbaseError('Ok web auth available only for WEBOK platform', 22));
            } else if(!okId || !okSecret || !okSessionKey){
                return callback(new GbaseError('Ok id, secret and session key are necessary', 23));
            } else if(this._authInProgressOrDone){
                return callback(new GbaseError('Already authenticated or in progress', 24));
            }

            let callbackFn = (err, body) => {
                if(err){
                    this._authInProgressOrDone = false;
                    callback(err);
                } else if(body.unicorn){
                    this._gbaseApi.currentUnicorn = body.unicorn;
                    this._gbaseApi.currentAccount = new GbaseAccount(body.fb, body.vk, body.ok, body.gClientId, body.gClientSecret, body.prof);
                    this._reauthLambda = cb => this.authWebOk(okId, okSecret, okSessionKey, cb);
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong - no unicorn. Check original response body', 32));
                }
            };

            this._authInProgressOrDone = true;
            this._gbaseApi._networkManager.doTheRequest(
                `${URIS['accounts.getAccount']}?okid=${okId}&oksecret=${okSecret}&oksessionkey=${okSessionKey}`, {},
                callbackFn
            );
        });
    }

    /**
     * You can still use OK.ru services for authentication if you making standalone or mobile app. SDK is provided and you can
     * use it to redeem a token. Provide this token here and Gbase backend will check it on its side.
     *
     * @param tokenFromOk {String} - self titled
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    authOkSdk(tokenFromOk, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!tokenFromOk){
                return callback(new GbaseError('Ok token is necessary', 25));
            } else if(this._authInProgressOrDone){
                return callback(new GbaseError('Already authenticated or in progress', 26));
            }

            let callbackFn = (err, body) => {
                if(err){
                    this._authInProgressOrDone = false;
                    callback(err);
                } else if(body.unicorn){
                    this._gbaseApi.currentUnicorn = body.unicorn;
                    this._gbaseApi.currentAccount = new GbaseAccount(body.fb, body.vk, body.ok, body.gClientId, body.gClientSecret, body.prof);
                    this._reauthLambda = cb => this.authOkSdk(tokenFromOk, cb);
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong - no unicorn. Check original response body', 33));
                }
            };

            this._authInProgressOrDone = true;
            this._gbaseApi._networkManager.doTheRequest(`${URIS['accounts.getAccount']}?oktoken=${tokenFromOk}`, {}, callbackFn);
        });
    }

    /**
     * An authentication using Facebook token. It can be taken from Facebook SDK or from Facebook iframe. And no restrictions on platform.
     *
     * @param tokenFromFb {String} - self titled
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    authFb(tokenFromFb, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!tokenFromFb){
                return callback(new GbaseError('Fb token is necessary', 93));
            } else if(this._authInProgressOrDone){
                return callback(new GbaseError('Already authenticated or in progress', 94));
            }

            let callbackFn = (err, body) => {
                if(err){
                    this._authInProgressOrDone = false;
                    callback(err);
                } else if(body.unicorn){
                    this._gbaseApi.currentUnicorn = body.unicorn;
                    this._gbaseApi.currentAccount = new GbaseAccount(body.fb, body.vk, body.ok, body.gClientId, body.gClientSecret, body.prof);
                    this._reauthLambda = cb => this.authFb(tokenFromFb, cb);
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong - no unicorn. Check original response body', 95));
                }
            };

            this._authInProgressOrDone = true;
            this._gbaseApi._networkManager.doTheRequest(`${URIS['accounts.getAccount']}?fbtoken=${tokenFromFb}`, {}, callbackFn);
        });
    }

    /**
     * Helper method to sign in again or repeat authentication using previously used. A helpful one if you'll once experience session rot.
     *
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    reAuth(callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._reauthLambda){
                return callback(new GbaseError('You didn\'t authorize yet', 34));
            }

            let callbackFn = (err, response) => {
                if(err){
                    callback(err);
                } else if(response.details.originalResponse.unicorn){
                    this._gbaseApi.currentUnicorn = response.details.originalResponse.unicorn;
                    this._gbaseApi.currentAccount = new GbaseAccount(
                        response.details.originalResponse.fb,
                        response.details.originalResponse.vk,
                        response.details.originalResponse.ok,
                        response.details.originalResponse.gClientId,
                        response.details.originalResponse.gClientSecret,
                        response.details.originalResponse.prof
                    );
                    callback(null, response);
                } else {
                    callback(new GbaseError('Something went wrong - no unicorn. Check original response body', 35));
                }
            };

            this._reauthLambda(callbackFn);
        });
    }

    /**
     * Just sign out and drop sequence, unicorn and other appropriate data.
     *
     */
    signout(){
        this._dropAuth();
    }

    /**
     * Link your previously made account with VK.com profile. After that you will be able to sign in with gClientId, gClientSecret pair and
     * using token from VK.com SDK. It will create new profile or link with previously created if you even once authenticated using VK.com credentials.
     * After this procedure you need to relogin. You can provide an argument "noNewProfile" to link your current profile with social profile. It will make
     * your account bi-login - you be able to login with both gClientId/gClientSecret and social token. This action is irreversible.
     *
     * @param tokenFromVk {String} - self titled
     * @param noNewProfile {boolean} - to create or not new profile
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    linkVkProfile(tokenFromVk, noNewProfile, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!tokenFromVk){
                return callback(new GbaseError('Vk token is necessary', 36));
            } else if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 37));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else if(body.success){
                    this._dropAuth();
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong. Check original response body', 38));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(
                `${URIS['accounts.linkVkProfile']}?vktoken=${tokenFromVk}${noNewProfile ? '&noprof=1' : ''}`, null,
                callbackFn
            );
        });
    }

    /**
     * Link your previously made account with OK.ru profile. After that you will be able to sign in with gClientId, gClientSecret pair and
     * using token from OK.ru SDK. It will create new profile or link with previously created if you even once authenticated using OK.ru credentials.
     * After this procedure you need to relogin. You can provide an argument "noNewProfile" to link your current profile with social profile. It will make
     * your account bi-login - you be able to login with both gClientId/gClientSecret and social token. This action is irreversible.
     *
     * @param tokenFromOk {String} - self titled
     * @param noNewProfile {boolean} - to create or not new profile
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    linkOkProfile(tokenFromOk, noNewProfile, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!tokenFromOk){
                return callback(new GbaseError('Ok token is necessary', 39));
            } else if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 40));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else if(body.success){
                    this._dropAuth();
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong. Check original response body', 41));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(
                `${URIS['accounts.linkOkProfile']}?oktoken=${tokenFromOk}${noNewProfile ? '&noprof=1' : ''}`, null,
                callbackFn
            );
        });
    }

    /**
     * Link your previously made account with Facebook profile. After that you will be able to sign in with gClientId, gClientSecret pair and
     * using token from Facebook SDK. It will create new profile or link with previously created if you even once authenticated using Facebook token.
     * After this procedure you need to relogin. You can provide an argument "noNewProfile" to link your current profile with social profile. It will make
     * your account bi-login - you be able to login with both gClientId/gClientSecret and social token. This action is irreversible.
     *
     * @param tokenFromFb {String} - self titled
     * @param noNewProfile {boolean} - to create or not new profile
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    linkFbProfile(tokenFromFb, noNewProfile, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!tokenFromFb){
                return callback(new GbaseError('Fb token is necessary', 42));
            } else if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 43));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else if(body.success){
                    this._dropAuth();
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                } else {
                    callback(new GbaseError('Something went wrong. Check original response body', 44));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(
                `${URIS['accounts.linkFbProfile']}?fbtoken=${tokenFromFb}${noNewProfile ? '&noprof=1' : ''}`, null,
                callbackFn
            );
        });
    }

    /**
     * Unlink your previously made account from any social profile. And links account with original Gbase profile. A new profile made
     * while linkage still can be accessed if you'll link once more or if authenticate with social credentials.
     * After this procedure you need to relogin.
     *
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    unlinkSocialProfile(callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!this._gbaseApi.currentUnicorn){
                return callback(new GbaseError('You need to auth first', 45));
            }

            let callbackFn = err => {
                if(err){
                    callback(err);
                } else {
                    this._dropAuth();
                    callback(null, new GbaseResponse(true, { originalResponse: undefined }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(URIS['accounts.unlinkSocialProfile'], null, callbackFn);
        });
    }

    /**
     * Checks if there any profile exists linked with particular VK.com profile. ID of VK.com profile determined by tokenFromVk.
     * It's useful to call before linking without creation new profile. Otherwise you will just get an error.
     *
     * @param tokenFromVk {String} - self titled
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    hasVkProfile(tokenFromVk, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!tokenFromVk){
                return callback(new GbaseError('Vk token is necessary', 96));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['accounts.hasVkProf']}?vktoken=${tokenFromVk}`, null, callbackFn);
        });
    }

    /**
     * Checks if there any profile exists linked with particular OK.com profile. ID of OK.com profile determined by tokenFromOk.
     * It's useful to call before linking without creation new profile. Otherwise you will just get an error.
     *
     * @param tokenFromOk {String} - self titled
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    hasOkProfile(tokenFromOk, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!tokenFromOk){
                return callback(new GbaseError('Ok token is necessary', 97));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['accounts.hasOkProf']}?oktoken=${tokenFromOk}`, null, callbackFn);
        });
    }

    /**
     * Checks if there any profile exists linked with particular Facebook profile. ID of Facebook profile determined by tokenFromFb.
     * It's useful to call before linking without creation new profile. Otherwise you will just get an error.
     *
     * @param tokenFromFb {String} - self titled
     * @param callback {Function} - standard callback(GbaseError err, GbaseResponse response)
     *
     * @returns {Promise} - returns promise if no callback provided
     */
    hasFbProfile(tokenFromFb, callback=NOOP){
        return someUtils.promisify(callback, callback => {
            if(!tokenFromFb){
                return callback(new GbaseError('Fb token is necessary', 98));
            }

            let callbackFn = (err, body) => {
                if(err){
                    callback(err);
                } else {
                    callback(null, new GbaseResponse(true, { originalResponse: body }));
                }
            };

            this._gbaseApi._networkManager.doTheRequest(`${URIS['accounts.hasFbProf']}?fbtoken=${tokenFromFb}`, null, callbackFn);
        });
    }
}

module.exports = GbaseAccounts;