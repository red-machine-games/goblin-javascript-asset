'use strict';

module.exports = {
    promisify
};

var GbaseConstants = require('../GbaseConstants.js');

const NOOP = GbaseConstants.NOOP;

function promisify(callbackArg, funcAsLambdaWithCallback){
    if(callbackArg && callbackArg !== NOOP){
        funcAsLambdaWithCallback(callbackArg);
        return undefined;
    }

    let resolve, reject;

    function callbackFn(err, response){
        if(err){
            reject(err);
        } else {
            resolve(response);
        }
    }

    return new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
        funcAsLambdaWithCallback(callbackFn);
    });
}