'use strict';

const USER_CHAT_IDS = require('../data/user-chat-ids');

const userService = require('../services/user-service');
const pendingActionService = require('../services/pending-action-service');

function requestMoneySendAction( senderChatId, {ammount, type, targetName}, fbSendTextMessage) {
	console.log(userService, userService.getUserByName);
	const targetUser = userService.getUserByName(targetName);
	const senderUser = userService.getUserByChatId(senderChatId);

	const message = `Hey ${targetName}, ${senderUser.name} want's to send \$${ammount} to you.`;

	const actionId = pendingActionService.registerPendingAction({
		ammount: parseFloat(ammount, 10),
		type: 'send',
	}, senderUser.id, targetUser.id);

	const quickActions = ['Accept', 'Reject'].map((name)=>({
		"content_type":"text",
		"title":name,
		"payload":`payment-response:${actionId}`
	}));

	return fbSendTextMessage(targetUser.chatId, {
        "text": message,
        "quick_replies": quickActions
    }).catch((err)=>{
    	console.error(err);
    });
}

function acceptActionByUser ( senderChatId, fbSendTextMessage ) {
	const pendingActions = pendingActionService.getPendingActionsByUserId(senderChatId);
	if ( pendingActions.length > 1 ) {
		console.error(`Too many pending actions for ${senderChatId}`);
	}

	if ( !pendingActions.length ) {
		console.error(`No pending action for ${senderChatId}`);
	}

	const {sourceUserId, targetUserId, ammount, type, id:actionId} = pendingActions[0];

	console.log(`will ${type} from ${sourceUserId} to ${targetUserId}`);

	if ( type === 'send' ) {
		userService
			.sendMoneyBetweenUsersByIds(sourceUserId, targetUserId, ammount)
			.then(pendingActions.resolvePendingAction(actionId))
			.then( () => {
				fbSendTextMessage( userService.getUserById(targetUserId).chatId, {
					"text": `Successfuly sent money to ${userService.getUserById(sourceUserId).name}`
				});
			});
	}

}

module.exports = requestMoneySendAction;