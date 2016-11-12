'use strict';

const requestMoneySendAction = require('./actions/request-money-send');

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

        pendingSend (request) {

            const {sessionId, entities} = request;
            const {value:ammout} = entities.amount_of_money[0];
            const {value:type} = entities.transferMoney[0];
            const {value:targetName} = entities.contact[0];

            const {fbid:senderId} = sessions[sessionId];

            console.log('pendign send', {senderId, ammout, type, targetName});

            return requestMoneySendAction(senderId, {ammout, type, targetName}, fbMessage)
                .then(()=>{
                    request.context.contact = request.entities.contact.value;
                    request.context.cash = request.entities.amount_of_money[0].value + request.entities.amount_of_money[0].unit;
                    return Promise.resolve(request.context); 
                });
        },

        findATM(request) {
            const sessionId = request.sessionId;
            const recipientId = sessions[sessionId].fbid;
            return fbMessage(recipientId, {
                "text": "Please share your location:",
                "quick_replies": [{"content_type": "location"}]
            });
        },

        done(request) {
            request.context.done = true;
            return Promise.resolve(null);
        }
    }
};

module.exports = actions;