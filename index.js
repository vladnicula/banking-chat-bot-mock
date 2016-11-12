'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fetch = require('node-fetch');
const app = express();
const parser = require('./parse-request');

const persistenceService = require('./persistence-service');

app.set('port', (process.env.PORT || 5000));

const USER_CHAT_IDS = {
	'Raul': '981647388611508',
	'Vlad': '1221584201246326',
	'Bogdan': '1325850250780262',
	'Horia': '1203276786414242',
	'Vivianne': '1130662566983525'
};

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const fbMessage = (id, text) => {
  const body = JSON.stringify({
    recipient: { id },
    message: { text },
  });
  const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
  return fetch('https://graph.facebook.com/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
  })
  .then(rsp => rsp.json())
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
};

const Wit = require('node-wit').Wit;
const log = require('node-wit').log;
const actions = require('./actions')(fbMessage, sessions);
// Webserver parameter
const PORT = process.env.PORT || 8445;
// Wit.ai parameters
const WIT_TOKEN = '5JI7XC4RZL2LBDC47LDBU5X443ZFEFYX';
// Setting up our bot
const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});

const findOrCreateSession = (fbid) => {
    let sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(k => {
        if (sessions[k].fbid === fbid) {
            // Yep, got it!
            sessionId = k;
        }
    });
    if (!sessionId) {
        // No session found for user fbid, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = { fbid: fbid, context: {} };
    }
    return sessionId;
};

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    res.send('Working!');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

function sendTextMessage(sender, msg) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: FB_PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: msg
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
        const event = req.body.entry[0].messaging[i];
        const sender = event.sender.id;
        const witSession = findOrCreateSession(sender);

        const session = persistenceService.getSessionOfUserId(sender);

        if ( session.flowState !== null ) {
        	console.log('should handle special flow case, not beginning of new flow');
        }

        console.log('JSON.stringify(event)', JSON.stringify(event));

        if ( event.message ) {
            const response = parser(event);
            sendTextMessage(sender, response);

            // Let's forward the message to the Wit.ai Bot Engine
            // This will run all actions until our bot has nothing left to do
            wit.runActions(
                witSession, // the user's current session
                event.message, // the user's message
                sessions[witSession].context // the user's current session state
            ).then((context) => {
                // Our bot did everything it has to do.
                // Now it's waiting for further messages to proceed.
                console.log('Waiting for next user messages');

                // Based on the session state, you might want to reset the session.
                // This depends heavily on the business logic of your bot.
                // Example:
                // if (context['done']) {
                //   delete sessions[witSession];
                // }

                // Updating the user's current session state
                sessions[witSession].context = context;
            })
                .catch((err) => {
                    console.error('Oops! Got an error from Wit: ', err.stack || err);
                })
        }
    }
    res.sendStatus(200);
});

// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
});

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;