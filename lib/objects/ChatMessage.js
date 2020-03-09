'use strict';

class ChatMessage{
    constructor(messageContent, authorHumanId, sequenceNumber, createdAt){
        this.messageContent = messageContent;
        this.authorHumanId = authorHumanId;
        this.sequenceNumber = sequenceNumber;
        this.createdAt = createdAt;
    }
}

module.exports = ChatMessage;