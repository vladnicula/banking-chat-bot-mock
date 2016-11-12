const USER_CHAT_IDS = require('../data/user-chat-ids');

const isTemporarySendRequest = (message='') => {
	const parts = message.split(' ');

	console.log('isTemporarySendRequest', {message}, parts.length, USER_CHAT_IDS[parts[1]]);

	if ( parts.length !== 2 ) {
		return false;
	}

	const name = parts[1];
	return USER_CHAT_IDS[name];
};

function requestMoneySendAction(senderIdentifer, messageText, fbSendTextMessage) {
	const [ammount, name] = messageText.split(' ');
	const message = `Hey ${name}, ${senderIdentifer} want's to send \$${ammount} to you.`;
	const quickActions = ['accept', 'reject'].map((name)=>({
		"content_type":"text",
		"title":name,
		"payload":name
	}));

	console.log('USER_CHAT_IDS[name]', USER_CHAT_IDS[name].chatId, {
    	"text": message,
    	"quick_replies": quickActions
    });

	fbSendTextMessage(USER_CHAT_IDS[name], {
        "text": message,
        "quick_replies": quickActions
    }).catch((err)=>{
    	console.error(err)
    });
}

module.exports = {
	requestMoneySendAction,
	isTemporarySendRequest
};