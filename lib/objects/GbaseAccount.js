'use strict';

class GbaseAccount{
    /**
     * A class holding all account related information. You can get it through API: GbaseAPI.currentAccount
     *
     * @param fb {String} - Facebook ID
     * @param vk {String} - VK.com ID
     * @param ok {String} - OK.ru ID
     * @param gClientId {String} - internal login string
     * @param gClientSecret {String} - internal secret/password string
     * @param haveProfile {boolean} - whether this account has any single profile
     */
    constructor(fb, vk, ok, gClientId, gClientSecret, haveProfile){
        this.fb = fb;
        this.vk = vk;
        this.ok = ok;
        this.gClientId = gClientId;
        this.gClientSecret = gClientSecret;
        this.haveProfile = !!haveProfile;
    }
}

module.exports = GbaseAccount;