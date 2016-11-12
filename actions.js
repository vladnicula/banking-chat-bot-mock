const actions = (fbMessage, sessions) => {
    return {
        send(request, response) {
            sessionId = request.sessionId;
            text = response.text;
            // Our bot has something to say!
            // Let's retrieve the Facebook user whose session belongs to
            const recipientId = sessions[sessionId].fbid;
            if (recipientId) {
                // Yay, we found our recipient!
                // Let's forward our bot response to her.
                // We return a promise to let our bot know when we're done sending
                return fbMessage(recipientId, text)
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

        findATM(request) {
            const sessionId = request.sessionId;
            const recipientId = sessions[sessionId].fbid;
            return fbMessage(recipientId, 'Test foarte specific din actions');
            // return new Promise((resolve, reject) => {
            // console.log('finding ATM');
            //     return resolve({
            //         location: 'iulius'
            //     });
            // });
        }
    }
}

module.exports = actions;