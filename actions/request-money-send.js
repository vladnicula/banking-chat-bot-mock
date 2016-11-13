'use strict';

const userService = require('../services/user-service');
const pendingActionService = require('../services/pending-action-service');

function requestMoneySendAction(senderChatId, {ammount, type, targetName}, fbSendTextMessage) {
    console.log(userService, userService.getUserByName);
    const targetUser = userService.getUserByName(targetName);
    const senderUser = userService.getUserByChatId(senderChatId);

    if (!targetUser) {
        return fbSendTextMessage(senderUser.chatId, {
            "text": `I couldn't find ${targetName}`
        }).catch((err)=> {
            console.error(err);
        });
    }

    const message = `Hey ${targetName}, ${senderUser.name} wants to send \$${ammount} to you.`;

    const actionId = pendingActionService.registerPendingAction({
        ammount: parseFloat(ammount),
        type: 'send'
    }, senderUser.id, targetUser.id);

    const quickActions = ['Accept', 'Reject'].map((name)=>({
        "content_type": "text",
        "title": name,
        "payload": `payment-response:${actionId}`
    }));

    fbSendTextMessage(senderUser.chatId, {
        "text": `Sending $${parseFloat(ammount)} to ${targetName} ...`
    });

    return fbSendTextMessage(targetUser.chatId, {
        "text": message,
        "quick_replies": quickActions
    }).catch((err)=> {
        console.error(err);
    });
}

function acceptActionByUser(senderChatId, fbSendTextMessage) {
    console.log('acceptActionByUser', senderChatId, fbSendTextMessage);
    const pendingActions = pendingActionService.getPendingActionsByUserId(senderChatId);
    if (pendingActions.length > 1) {
        console.error(`Too many pending actions for ${senderChatId}`);
    }

    if (!pendingActions.length) {
        console.error(`No pending action for ${senderChatId}`);
    }

    const {sourceUserId, targetUserId, ammount, type, id:actionId} = pendingActions[0];

    console.log(`will ${type} from ${sourceUserId} to ${targetUserId}`);

    if (type === 'send') {
        return userService
            .sendMoneyBetweenUsersByIds(sourceUserId, targetUserId, ammount)
            .then(pendingActionService.resolvePendingAction(actionId))
            .then(() => {
                return Promise.all([
                    fbSendTextMessage(userService.getUserById(targetUserId).chatId, {
                        "text": `Successfully received money from ${userService.getUserById(sourceUserId).name}`
                    }),

                    fbSendTextMessage(userService.getUserById(sourceUserId).chatId, {
                        "text": `${userService.getUserById(targetUserId).name} accepted your transaction.`
                    })
                ]);
            });
    }
}

function rejectActionByUser(senderChatId, fbSendTextMessage) {
  console.log('rejectActionByUser', senderChatId, fbSendTextMessage);
  const pendingActions = pendingActionService.getPendingActionsByUserId(senderChatId);
  if (pendingActions.length > 1) {
    console.error(`Too many pending actions for ${senderChatId}`);
  }

  if (!pendingActions.length) {
    console.error(`No pending action for ${senderChatId}`);
  }

  const {sourceUserId, targetUserId, ammount, type, id:actionId} = pendingActions[0];

  console.log(`will reject ${type} from ${sourceUserId} to ${targetUserId}`);

  if (type === 'send') {
    return pendingActionService.resolvePendingAction(actionId)
      .then(() => {
        return Promise.all([
          fbSendTextMessage(userService.getUserById(targetUserId).chatId, {
            "text": `Rejected the transfer request from ${userService.getUserById(sourceUserId).name}`
          }),

          fbSendTextMessage(userService.getUserById(sourceUserId).chatId, {
            "text": `${userService.getUserById(targetUserId).name} rejected your transaction.`
          })
        ]);
    });
  }
}

module.exports = {requestMoneySendAction, acceptActionByUser, rejectActionByUser};