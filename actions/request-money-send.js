const USER_CHAT_IDS = require('../data/user-chat-ids');

const isTemporarySendRequest = (message) => {
	const parts = message.split(' ');
	if ( parts.lenght !== 2 ) {
		return false;
	}

	const name = parts[0];
	return USER_CHAT_IDS[name];
};

function requestMoneySendAction(senderIdentifer, messageText, sendTextMessage) {
	const [ammount, name] = messageText.split(' ');
	const message = `Hey ${name}, ${senderIdentifer} want's to send \$${ammout} to you.`;
	const quickActions = ['accept', 'reject'];

	sendTextMessage(USER_CHAT_IDS[recieverName], {
        "text": message,
        "quick_replies": quickActions
    });
}

module.exports = {
	requestMoneySendAction,
	isTemporarySendRequest
};