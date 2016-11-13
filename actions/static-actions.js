'use strict';

const {acceptActionByUser, rejectActionByUser} = require('./request-money-send');
const userService = require('../services/user-service');
const pendingActionService = require('../services/pending-action-service');

const staticActions = (event, fbSend) => {
    const attachments = event.message.attachments;
    const senderId = event.sender.id;

    // Handle location
    if (attachments && attachments[0].payload.coordinates) {
        const ATMLocation = '46.771450,23.626898';
        const currentLocation = `${attachments[0].payload.coordinates.lat},${attachments[0].payload.coordinates.long}`;
        const directionsUrl = `http://www.google.com/maps/dir/${currentLocation}/${ATMLocation}`;

        return fbSend(event.sender.id, {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Directions to nearest ATM",
                        "image_url": `http:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=${ATMLocation}&zoom=15&markers=${ATMLocation}`,
                        "item_url": `http:\/\/maps.apple.com\/maps?q=${ATMLocation}&z=16`,
                        "buttons": [{
                            'type': 'web_url',
                            'url': directionsUrl,
                            'title': 'Get Directions'
                        }]
                    }]
                }
            }
        });
    }

    const sendingUserInternalId = userService.getUserByChatId(senderId).id;
    const pendingActionsForUser = pendingActionService.getPendingActionsByUserId(sendingUserInternalId).length;
    const lowerCasedMessage = event.message.text.toLowerCase();

    if ( pendingActionsForUser ) {
        if ( lowerCasedMessage === 'accept' ) {
            return acceptActionByUser(sendingUserInternalId, fbSend);
        } else if ( lowerCasedMessage === 'reject' ) {
            return rejectActionByUser(sendingUserInternalId, fbSend);
        }
    }

    return null;
};

module.exports = staticActions;