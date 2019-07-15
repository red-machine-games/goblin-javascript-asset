'use strict';

/**
 * To work with API you need to instantiate GbaseApi object.
 */

global.Gbase = {
    GbaseApi: require('./lib/GbaseApi.js'),
    GbaseResponse: require('./lib/objects/GbaseResponse.js'),
    GbaseError: require('./lib/objects/GbaseError.js'),
    GbaseRangePicker: require('./lib/objects/GbaseRangePicker.js'),
    GbasePvp: require('./lib/pvp/GbasePvp.js')
};