'use strict';

var expect = require('chai').expect,
    async = require('async');

const START_AT_HOST = require('./testEntryPoint.js').START_AT_HOST, START_AT_PORT = require('./testEntryPoint.js').START_AT_PORT,
    LOCAL_ADDRESS = `http://${START_AT_HOST}:${START_AT_PORT}`,
    HMAC_SECRET = require('./testEntryPoint.js').HMAC_SECRET;

var GbaseApi = require('../lib/GbaseApi.js'),
    GbaseResponse = require('../lib/objects/GbaseResponse.js');

describe('testPve.js', () => {
    var firstApi, secondApi;

    describe('Stuff', () => {
        it('Should init api', () => {
            firstApi = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
            secondApi = new GbaseApi(null, null, HMAC_SECRET, 'stdl', '0.0.2', LOCAL_ADDRESS);
        });
    });
    describe('Init users', () => {
        it('Should signup #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            firstApi.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile #1', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            firstApi.profile.create(callbackFn);
        });
        it('Should signup #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            secondApi.account.signupGbaseAnon(callbackFn);
        });
        it('Should create profile #2', done => {
            let callbackFn = (err, response) => {
                expect(err).to.be.a('null');
                expect(response).to.be.an.instanceof(GbaseResponse);

                expect(response.ok).to.be.equal(true);

                done();
            };

            secondApi.profile.create(callbackFn);
        });
    });
    describe('Test out chats', () => {
        var player1Group1, player1Group2,
            player2Group1, player2Group2;

        it('Player 1 should enter group-1', () => {
            player1Group1 = firstApi.chats.enterChatGroup('group-1');
        });
        it('Player 1 should enter group-2', () => {
            player1Group2 = firstApi.chats.enterChatGroup('group-2');
        });
        it('Player 2 should enter group-1', () => {
            player2Group1 = secondApi.chats.enterChatGroup('group-1');
        });
        it('Player 2 should enter group-2', () => {
            player2Group2 = secondApi.chats.enterChatGroup('group-2');
        });
        it('Player 1 should post message in group 1 and both should see it', done => {
            const MESSAGE_TO_SEND = 'Fish Out Of Water';

            var message1, message2, send;

            let onMessage1 = mess => {
                if(message1){
                    done(new Error('WTF 1'));
                } else {
                    message1 = mess.messageContent;
                    generalCallback();
                }
            };
            let onMessage2 = mess => {
                if(message2){
                    done(new Error('WTF 2'));
                } else {
                    message2 = mess.messageContent;
                    generalCallback();
                }
            };

            player1Group1.on('message', onMessage1);
            player2Group1.on('message', onMessage2);

            player1Group1.listen();
            player2Group1.listen();

            let onSend = (err, response) => {
                if(err || !response.ok){
                    done(err || response);
                } else if(send){
                    done(new Error('WTF 3'));
                } else {
                    send = true;
                    generalCallback();
                }
            };

            player1Group1.post(MESSAGE_TO_SEND, onSend);

            let generalCallback = () => {
                if(message1 === MESSAGE_TO_SEND && message2 === MESSAGE_TO_SEND && send){
                    player1Group1.removeListener('message', onMessage1);
                    player2Group1.removeListener('message', onMessage2);
                    done();
                }
            };
        });
        it('Player 2 should post message in group 1 and both should see it', done => {
            const MESSAGE_TO_SEND = 'Playing For Keeps';

            var message1, message2, send;

            let onMessage1 = mess => {
                if(message1){
                    done(new Error('WTF 1'));
                } else {
                    message1 = mess.messageContent;
                    generalCallback();
                }
            };
            let onMessage2 = mess => {
                if(message2){
                    done(new Error('WTF 2'));
                } else {
                    message2 = mess.messageContent;
                    generalCallback();
                }
            };

            player1Group1.on('message', onMessage1);
            player2Group1.on('message', onMessage2);

            let onSend = (err, response) => {
                if(err || !response.ok){
                    done(err || response);
                } else if(send){
                    done(new Error('WTF 3'));
                } else {
                    send = true;
                    generalCallback();
                }
            };

            player2Group1.post(MESSAGE_TO_SEND, onSend);

            let generalCallback = () => {
                if(message1 === MESSAGE_TO_SEND && message2 === MESSAGE_TO_SEND && send){
                    player1Group1.removeListener('message', onMessage1);
                    player2Group1.removeListener('message', onMessage2);

                    player1Group1.unlisten();
                    player2Group1.unlisten();

                    done();
                }
            };
        });
        it('Player 1 should post message in group 2 and both should see it', done => {
            const MESSAGE_TO_SEND = 'Hard Pill to Swallow';

            var message1, message2, send;

            let onMessage1 = mess => {
                if(message1){
                    done(new Error('WTF 1'));
                } else {
                    message1 = mess.messageContent;
                    generalCallback();
                }
            };
            let onMessage2 = mess => {
                if(message2){
                    done(new Error('WTF 2'));
                } else {
                    message2 = mess.messageContent;
                    generalCallback();
                }
            };

            player1Group2.on('message', onMessage1);
            player2Group2.on('message', onMessage2);

            player1Group2.listen();
            player2Group2.listen();

            let onSend = (err, response) => {
                if(err || !response.ok){
                    done(err || response);
                } else if(send){
                    done(new Error('WTF 3'));
                } else {
                    send = true;
                    generalCallback();
                }
            };

            player1Group2.post(MESSAGE_TO_SEND, onSend);

            let generalCallback = () => {
                if(message1 === MESSAGE_TO_SEND && message2 === MESSAGE_TO_SEND && send){
                    player1Group2.removeListener('message', onMessage1);
                    player2Group2.removeListener('message', onMessage2);
                    done();
                }
            };
        });
        it('Player 2 should post message in group 2 and both should see it', done => {
            const MESSAGE_TO_SEND = 'Hard Pill to Swallow';

            var message1, message2, send;

            let onMessage1 = mess => {
                if(message1){
                    done(new Error('WTF 1'));
                } else {
                    message1 = mess.messageContent;
                    generalCallback();
                }
            };
            let onMessage2 = mess => {
                if(message2){
                    done(new Error('WTF 2'));
                } else {
                    message2 = mess.messageContent;
                    generalCallback();
                }
            };

            player1Group2.on('message', onMessage1);
            player2Group2.on('message', onMessage2);

            let onSend = (err, response) => {
                if(err || !response.ok){
                    done(err || response);
                } else if(send){
                    done(new Error('WTF 3'));
                } else {
                    send = true;
                    generalCallback();
                }
            };

            player2Group2.post(MESSAGE_TO_SEND, onSend);

            let generalCallback = () => {
                if(message1 === MESSAGE_TO_SEND && message2 === MESSAGE_TO_SEND && send){
                    player1Group2.removeListener('message', onMessage1);
                    player2Group2.removeListener('message', onMessage2);

                    player1Group1.unlisten();
                    player2Group1.unlisten();

                    done();
                }
            };
        });
        it('Player 1 should list history', done => {
            const MESSAGE_1 = 'Yada Yada',
                MESSAGE_2 = 'Beating Around the Bush';

            var messages = [], load;

            let onMessage = message => {
                messages.push(message.messageContent);
                generalCallback();
            };
            let onLoad = (err, responses) => {
                if(err || !responses.every(e => e.ok)){
                    done(err || new Error('WTF 1'));
                } else {
                    if(load){
                        done(new Error('WTF 2'));
                    } else {
                        load = true;
                        generalCallback();
                    }
                }
            };
            let generalCallback = () => {
                if(load && messages.length === 2){
                    expect(messages[0]).to.be.equal(MESSAGE_2);
                    expect(messages[1]).to.be.equal(MESSAGE_1);

                    done();
                }
            };

            var chatRoom = firstApi.chats.enterChatGroup('group-b');

            chatRoom.on('message', onMessage);
            async.series([
                cb => chatRoom.post(MESSAGE_1, cb),
                cb => chatRoom.post(MESSAGE_2, cb),
                cb => chatRoom.listen(cb),
                cb => chatRoom.loadHistory(cb)
            ], onLoad);
        });
    });
});