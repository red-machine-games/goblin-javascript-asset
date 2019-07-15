'use strict';

class GbaseError{
    /**
     * A class to represent standard Gbase API error
     *
     * @param message {String} - message string
     * @param code {Number} - unique code of error
     * @param [details] {Object} - optional any-schema details
     */
    constructor(message, code, details){
        this.code = code;
        this.message = message;
        this.details = details;
    }
}

module.exports = GbaseError;