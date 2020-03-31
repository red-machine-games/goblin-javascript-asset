'use strict';

const ROOT_DOMAIN = '.goblinserver.com',
    PLATFORMS_MAP = {
        IOS: 'ios',         // Apple iOS
        ANDROID: 'android', // Any Android
        WEBOK: 'webok',     // Web build inside of OK.ru iframe
        STDL: 'stdl',       // Standalone (Desktop app or web build for standalone website)
        WEBVK: 'webvk',     // Web build inside of VK.com iframe
        WEBFB: 'webfb'      // Web build inside of facebook.com iframe
    },
    MATCHMAKING_STRATEGIES_MAP = {
        BY_RATING: 'byr',
        BY_LADDER: 'bylad'
    },
    URI_PREFIX = 'api/v0',
    URIS = {
        ['accounts.getAccount']: `${URI_PREFIX}/accounts.getAccount`,
        ['utils.ping']: `${URI_PREFIX}/utils.ping`,
        ['accounts.linkVkProfile']: `${URI_PREFIX}/accounts.linkVkProfile`,
        ['accounts.linkOkProfile']: `${URI_PREFIX}/accounts.linkOkProfile`,
        ['accounts.linkFbProfile']: `${URI_PREFIX}/accounts.linkFbProfile`,
        ['accounts.unlinkSocialProfile']: `${URI_PREFIX}/accounts.unlinkSocialProfile`,
        ['accounts.hasVkProf']: `${URI_PREFIX}/accounts.hasVkProf`,
        ['accounts.hasOkProf']: `${URI_PREFIX}/accounts.hasOkProf`,
        ['accounts.hasFbProf']: `${URI_PREFIX}/accounts.hasFbProf`,
        ['profile.createProfile']: `${URI_PREFIX}/profile.createProfile`,
        ['profile.getProfile']: `${URI_PREFIX}/profile.getProfile`,
        ['profile.setProfile']: `${URI_PREFIX}/profile.setProfile`,
        ['profile.updateProfile']: `${URI_PREFIX}/profile.updateProfile`,
        ['profile.getPublicProfile']: `${URI_PREFIX}/profile.getPublicProfile`,
        ['tops.postARecord']: `${URI_PREFIX}/tops.postARecord`,
        ['tops.getPlayerRecord']: `${URI_PREFIX}/tops.getPlayerRecord`,
        ['tops.getLeadersOverall']: `${URI_PREFIX}/tops.getLeadersOverall`,
        ['tops.removeRecord']: `${URI_PREFIX}/tops.removeRecord`,
        ['tops.refreshVkFriendsCache']: `${URI_PREFIX}/tops.refreshVkFriendsCache`,
        ['tops.refreshFbFriendsCache']: `${URI_PREFIX}/tops.refreshFbFriendsCache`,
        ['tops.refreshOkFriendsCache']: `${URI_PREFIX}/tops.refreshOkFriendsCache`,
        ['tops.getSomeonesRating']: `${URI_PREFIX}/tops.getSomeonesRating`,
        ['tops.getLeadersWithinFriends']: `${URI_PREFIX}/tops.getLeadersWithinFriends`,
        ['pve.beginSimple']: `${URI_PREFIX}/pve.beginSimple`,
        ['pve.actSimple']: `${URI_PREFIX}/pve.actSimple`,
        ['mm.matchPlayer']: `${URI_PREFIX}/mm.matchPlayer`,
        ['mm.matchBot']: `${URI_PREFIX}/mm.matchBot`,
        ['pvp.checkBattleNoSearch']: `${URI_PREFIX}/pvp.checkBattleNoSearch`,
        ['pvp.dropMatchmaking']: `${URI_PREFIX}/pvp.dropMatchmaking`,
        ['pvp.searchForOpponent']: `${URI_PREFIX}/pvp.searchForOpponent`,
        ['pvp.searchForBotOpponent']: `${URI_PREFIX}/pvp.searchForBotOpponent`,
        ['pvp.stopSearchingForOpponent']: `${URI_PREFIX}/pvp.stopSearchingForOpponent`,
        ['pvp.handSelectOpponent']: `${URI_PREFIX}/pvp.handSelectOpponent`,
        ['pvp.acceptMatch']: `${URI_PREFIX}/pvp.acceptMatch`,
        ['pvp.waitForOpponentToAccept']: `${URI_PREFIX}/pvp.waitForOpponentToAccept`,
        ['pvp.declineMatch']: `${URI_PREFIX}/pvp.declineMatch`,
        ['battles.listBattles']: `${URI_PREFIX}/battles.listBattles`,
        ['pve.listBattles']: `${URI_PREFIX}/pve.listBattles`,
        ['vkJobs.listPurchases']: `${URI_PREFIX}/vkJobs.listPurchases`,
        ['vkJobs.consumePurchase']: `${URI_PREFIX}/vkJobs.consumePurchase`,
        ['okJobs.listPurchases']: `${URI_PREFIX}/okJobs.listPurchases`,
        ['okJobs.consumePurchase']: `${URI_PREFIX}/okJobs.consumePurchase`,
        ['utils.getServerTime']: `${URI_PREFIX}/utils.getServerTime`,
        ['utils.getSequence']: `${URI_PREFIX}/utils.getSequence`,
        ['utils.purchaseValidation']: `${URI_PREFIX}/utils.purchaseValidation`,
        ['tickets.sendTicket']: `${URI_PREFIX}/tickets.sendTicket`,
        ['tickets.sendTicketVk']: `${URI_PREFIX}/tickets.sendTicketVk`,
        ['tickets.sendTicketOk']: `${URI_PREFIX}/tickets.sendTicketOk`,
        ['tickets.sendTicketFb']: `${URI_PREFIX}/tickets.sendTicketFb`,
        ['tickets.listSendedTickets']: `${URI_PREFIX}/tickets.listSendedTickets`,
        ['tickets.listReceivedTickets']: `${URI_PREFIX}/tickets.listReceivedTickets`,
        ['tickets.confirmTicket']: `${URI_PREFIX}/tickets.confirmTicket`,
        ['tickets.confirmTicketVk']: `${URI_PREFIX}/tickets.confirmTicketVk`,
        ['tickets.confirmTicketOk']: `${URI_PREFIX}/tickets.confirmTicketOk`,
        ['tickets.confirmTicketFb']: `${URI_PREFIX}/tickets.confirmTicketFb`,
        ['tickets.rejectTicket']: `${URI_PREFIX}/tickets.rejectTicket`,
        ['tickets.rejectTicketVk']: `${URI_PREFIX}/tickets.rejectTicketVk`,
        ['tickets.rejectTicketOk']: `${URI_PREFIX}/tickets.rejectTicketOk`,
        ['tickets.rejectTicketFb']: `${URI_PREFIX}/tickets.rejectTicketFb`,
        ['tickets.dischargeTicket']: `${URI_PREFIX}/tickets.dischargeTicket`,
        ['tickets.dismissTicket']: `${URI_PREFIX}/tickets.dismissTicket`,
        ['tickets.releaseTicket']: `${URI_PREFIX}/tickets.releaseTicket`,
        ['chats.message']: `${URI_PREFIX}/chats.message`,
        ['chats.list']: `${URI_PREFIX}/chats.list`,
        ['chats.fetch']: `${URI_PREFIX}/chats.fetch`
    },
    DEFAULT_RECORDS_SEGMENT = 'def';

const G_CLIENT_SECRET_REGEXP = /[A-Za-z0-9._@]{6,64}$/,
    G_CLIENT_ID_REGEXP = /[A-Za-z0-9._@]{4,32}$/;

const NOOP = () => {};

module.exports = {
    ROOT_DOMAIN,
    PLATFORMS_MAP,
    MATCHMAKING_STRATEGIES_MAP,
    URI_PREFIX,
    URIS,
    DEFAULT_RECORDS_SEGMENT,
    G_CLIENT_SECRET_REGEXP,
    G_CLIENT_ID_REGEXP,
    NOOP
};