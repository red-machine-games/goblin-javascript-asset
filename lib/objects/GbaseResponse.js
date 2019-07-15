'use strict';

class GbaseResponse{
    /**
     * Standard Gbase API response
     *
     * @param isOk {boolean} - whether done okay
     * @param [details] {Object} - optional any-schema details
     */
    constructor(isOk, details){
        this.ok = isOk;
        this.details = details;
    }
}

module.exports = GbaseResponse;