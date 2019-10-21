'use strict';

const TEST_PREFS = require('./!testPrefs.json');

const START_AT_HOST = TEST_PREFS.START_AT_HOST, START_AT_PORT = TEST_PREFS.START_AT_PORT,
    VK_TEST_CLIENT_ID = TEST_PREFS.VK_TEST_CLIENT_ID, VK_TEST_CLIENT_SECRET = TEST_PREFS.VK_TEST_CLIENT_SECRET,
    OK_TEST_APPLICATION_PUBLIC_KEY = TEST_PREFS.OK_TEST_APPLICATION_PUBLIC_KEY, OK_TEST_APPLICATION_SECRET_KEY = TEST_PREFS.OK_TEST_APPLICATION_SECRET_KEY,
    HMAC_SECRET = TEST_PREFS.HMAC_SECRET;

module.exports = {
    START_AT_HOST,
    START_AT_PORT,

    VK_TEST_CLIENT_ID,
    VK_TEST_CLIENT_SECRET,

    OK_TEST_APPLICATION_PUBLIC_KEY,
    OK_TEST_APPLICATION_SECRET_KEY,

    HMAC_SECRET
};

const MONGODB_HOST = TEST_PREFS.MONGODB_HOST, MONGODB_PORT = TEST_PREFS.MONGODB_PORT, MONGODB_DATABASE_NAME = TEST_PREFS.MONGODB_DATABASE_NAME,
    REDIS_HOST = TEST_PREFS.REDIS_HOST, REDIS_PORT = TEST_PREFS.REDIS_PORT;

describe('Run Goblin Base Server', () => {
    var GoblinBase = require('goblin-base-server');

    it('Should run', done => {
        GoblinBase.getGoblinBase()
            .configureDatabase({ connectionUrl: `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE_NAME}` })
            .configureRedis(new GoblinBase.RedisConfig()
                .setupSessionsClient(REDIS_HOST, REDIS_PORT, { db: 0 })
                .setupLeaderboardClient(REDIS_HOST, REDIS_PORT, { db: 1 })
                .setupMatchmakingClient(REDIS_HOST, REDIS_PORT, { db: 2 })
                .setupPvpRoomClient(REDIS_HOST, REDIS_PORT, { db: 3 })
                .setupSimpleGameplayClient(REDIS_HOST, REDIS_PORT, { db: 4 })
                .setupServiceClient(REDIS_HOST, REDIS_PORT, { db: 5 })
                .setupMaintenanceClient(REDIS_HOST, REDIS_PORT, { db: 6 })
                .setupResourceLockerClient(REDIS_HOST, REDIS_PORT, { db: 7 })
            )
            .includeAccounts({ lastActionTimeout: 1000 * 60, sessionLifetime: 60 * 1000 })
            .includeProfiles()
            .includeTickets({ ticketLifetime: 1000 })
            .includeLeaderboards({
                whitelistSegments: ['def', 'segma']
            })
            .includeMatchmaking({
                strategy: 'open',
                maxSearchRanges: 4,
                rememberAsyncOpponentMs: 2000,
                numericConstants: {
                    longPollingColdResponseAfterMs: 1000 * 3,
                    longPollingDestroyAfterMs: 1000 * 25,
                    timeForSearchMs: 1000 * 6,
                    timeForAcceptanceMs: 1000 * 6,
                    refreshStatsReloadingMs: 1000,
                    refreshStatsBatchSize: 100,
                    gameroomBookingTtl: 1000 * 6,
                    playerInGameroomTtl: 1000 * 15
                }
            })
            .includePvp({
                apiPrefix: 'api/v0/',
                displayHost: '127.0.0.1',
                physicalPort: 7331,
                displayPortWs: 7331,
                displayPortWss: 0,
                shareIPAddress: true,
                pairsCapacity: 100,
                numericConstants: {
                    heartbeatIntervalMs: 500,
                    timeToConnectPairMs: 1000 * 5,
                    checkSocketsEveryMs: 1000 * 2,
                    connectionLockTtlMs: 1000 * 5,
                    messageLockTtlMs: 1000,
                    pairInGameTtlMs: 1000 * 10,
                    socketTtlMs: 1000 * 2,
                    timeToProcessMessageMs: 1000 * 2,
                    unpausedGameTtlMs: 1000 * 8,
                    pausedPairTtlMs: 1000 * 7,
                    pausedTimedoutPairInactivityMs: 1000 * 2,
                    refreshStatsReloadingMs: 1000,
                    refreshStatsBatchSize: 100,
                    refreshOccupationReloadingMs: 1000,
                    absoluteMaximumGameplayTtlMs: 1000 * 60 * 30
                }
            })
            .includeSimplePve()
            .includeAuthoritarian()
            .includeCloudFunctions()
            .requireAsCloudFunction('./defaultCloudFunctions/pveInit.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pveAct.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pveFinalize.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pvpAutoCloseHandler.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pvpCheckGameOver.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pvpConnectionHandler.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pvpDisconnectionHandler.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pvpGameOverHandler.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pvpGeneratePayload.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pvpInitGameplayModel.js')
            .requireAsCloudFunction('./defaultCloudFunctions/pvpTurnHandler.js')
            .addPlatform({ header: GoblinBase.PLATFORMS.STANDALONE })
            .addPlatform({ header: GoblinBase.PLATFORMS.WEB_VK })
            .addPlatform({ header: GoblinBase.PLATFORMS.WEB_OK })
            .addPlatform({ header: GoblinBase.PLATFORMS.WEB_FB })
            .addVkCredentials({ clientId: VK_TEST_CLIENT_ID, clientSecret: VK_TEST_CLIENT_SECRET, useTokenAsId: true })
            .addOkCredentials({ applicationPublicKey: OK_TEST_APPLICATION_PUBLIC_KEY, applicationSecretKey: OK_TEST_APPLICATION_SECRET_KEY, useTokenAsId: true })
            .addFacebookCredentials({ clientId: 123, clientSecret: 'abcdef', useTokenAsId: true })
            .hookLogs({ info: console.log, warn: console.log, error: console.error, fatal: console.error })
            .start(START_AT_PORT, START_AT_HOST, 'api/v0/', done);
    });
    it('Should drop databases', done => {
        GoblinBase.getGoblinBase()._clearDatabases(done);
    });
});
describe('Auth', () => {
    require('./testAuth.js');
});
describe('Link profile', () => {
    require('./testLinkProfile.js');
});
describe('Matchmaking', () => {
    require('./testMatchmaking.js');
});
describe('Profiles', () => {
    require('./testProfilesStuff.js');
});
describe('Pve', () => {
    require('./testPve.js');
});
describe('Pvp', () => {
    require('./testPvp.js');
});
describe('Queue', () => {
    require('./testQueue.js');
});
describe('Leaderboards', () => {
    require('./testRecordsAndLeaderboard.js');
});
describe('Social', () => {
    require('./testSocial.js');
});
describe('Tickets', () => {
    require('./testTickets.js');
});
describe('Utils', () => {
    require('./testUtils.js');
});