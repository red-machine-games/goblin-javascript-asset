'use strict';

var GbaseError = require('./GbaseError.js');

const POSITIVE_INFINITY = '+inf',
    NEGATIVE_INFINITY = '-inf';

class GbaseRangePicker{
    static get POSITIVE_INFINITY(){ return POSITIVE_INFINITY };
    static get NEGATIVE_INFINITY(){ return NEGATIVE_INFINITY };

    /**
     * A chain-call range builder object for matchmaking
     *
     * @param [head] {String} - Any range header string
     * @param [nRandom] {Number} - Amount of bunch of appropriate opponents to randomly pick among
     */
    constructor(head, nRandom=1){
        this.head = head;
        this.rgs = [];
        this.nran = nRandom;
    }

    /**
     * Sets yet another range
     *
     * @param from {Number} - a from value
     * @param to {Number} - a to value
     * @returns {GbaseRangePicker} - this
     */
    range(from, to){
        if(from == null || (typeof from === 'number' && isNaN(from)) || (typeof from !== 'number' && from !== POSITIVE_INFINITY && from !== NEGATIVE_INFINITY)){
            throw new new GbaseError('Argument from is invalid', 182);
        } else if(to == null || (typeof to === 'number' && isNaN(to)) || (typeof to !== 'number' && to !== POSITIVE_INFINITY && to !== NEGATIVE_INFINITY)){
            throw new new GbaseError('Argument to is invalid', 183);
        }
        this.rgs.push({ from, to });

        return this;
    }
}

module.exports = GbaseRangePicker;