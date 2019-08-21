'use strict';

/**
 * To work with API you need to instantiate GbaseApi object.
 */

var Gbase = {
    GbaseApi: require('./lib/GbaseApi.js').GbaseApi,
    GbaseResponse: require('./lib/objects/GbaseResponse.js'),
    GbaseError: require('./lib/objects/GbaseError.js'),
    GbaseRangePicker: require('./lib/objects/GbaseRangePicker.js'),
    GbasePvp: require('./lib/pvp/GbasePvp.js')
};

module.exports = {
    Gbase
};
global.Gbase = Gbase;