'use strict';

const {requestMoneySendAction} = require('./request-money-send');
const userService = require('../services/user-service');

const actions = (fbMessage, sessions) => {
    return {

        send(request, response) {
            const sessionId = request.sessionId;
            const text = response.text;
            // Our bot has something to say!
            // Let's retrieve the Facebook user whose session belongs to
            const recipientId = sessions[sessionId].fbid;
            if (recipientId) {
                // Yay, we found our recipient!
                // Let's forward our bot response to her.
                // We return a promise to let our bot know when we're done sending
                return fbMessage(recipientId, {text: text})
                    .then(() => null)
                    .catch((err) => {
                        console.error(
                            'Oops! An error occurred while forwarding the response to',
                            recipientId,
                            ':',
                            err.stack || err
                        );
                    });
            } else {
                console.error('Oops! Couldn\'t find user for session:', sessionId);
                // Giving the wheel back to our bot
                return Promise.resolve()
            }
        },

        /** Triggered when a user wants to send money to another */
        pendingSend (request) {
            const {entities} = request;
            const {fbid:senderId} = sessions[request.sessionId];

            try {
                const {value:ammount} = entities.amount_of_money[0];
                const {value:type} = entities.transferMoney[0];
                const {value:targetName} = entities.contact ? entities.contact[0] : entities.location && entities.location[0];

                console.log('pending send', {senderId, ammount, type, targetName});

                return requestMoneySendAction(senderId, {ammount, type, targetName}, fbMessage)
                    .then(()=> {
                        request.context.contact = request.entities.contact.value;
                        request.context.cash = request.entities.amount_of_money[0].value + request.entities.amount_of_money[0].unit;
                        return Promise.resolve(request.context);
                    });
            } catch (err) {
                return fbMessage(senderId, {text: 'Sorry, I could not understand your request completely.'});
            }
        },

        /** Triggered when user wants to find an ATM nearby */
        findATM(request) {
            const sessionId = request.sessionId;
            const recipientId = sessions[sessionId].fbid;
            return fbMessage(recipientId, {
                "text": "Please share your location:",
                "quick_replies": [{"content_type": "location"}]
            });
        },

        /** Triggered when a user wants to check their account balance */
        getBalance(request) {
            const {fbid:senderId} = sessions[request.sessionId];
            const senderUser = userService.getUserByChatId(senderId);
            const balance = senderUser.balance;
            const savingsBalance = senderUser.balanceSavings;

            return fbMessage(senderId, {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Current account balance",
                                "image_url": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcT7fMBEDwtqCr_50CjOlQiuaIoJ0McIA5PFHJKpPZMb1A_w1_Eh",
                                "subtitle": `$${balance}`
                            },
                            {
                                "title": "Savins account balance",
                                "image_url": "https://cdn3.iconfinder.com/data/icons/shopping-icons-1/512/Piggy_Bank-512.png",
                                "subtitle": `$${savingsBalance}`
                            }
                        ]
                    }
                }
            });
        },

        sayHello(request) {
            const {fbid:senderId} = sessions[request.sessionId];
            const sender = userService.getUserByChatId(senderId);
            return fbMessage(senderId, {text: `Hello there ${sender.name}. What can I help you with?`});
        },

        /** Triggered when user wants to transfer money from one of their accounts to another */
        transferBetweenAccounts(request) {
            const {fbid:senderId} = sessions[request.sessionId];
            const senderUser = userService.getUserByChatId(senderId);
            return fbMessage(senderId, {
                "text": senderUser.balance
            });
        },

        done(request) {
            request.context.done = true;
            return Promise.resolve(null);
        }
    }
};

module.exports = actions;