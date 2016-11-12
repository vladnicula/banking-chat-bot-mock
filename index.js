'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fetch = require('node-fetch');
const app = express();
app.set('port', (process.env.PORT || 5000));
const handleStaticActions = require('./static-actions');
const store = require('./services/store')

const Wit = require('node-wit').Wit;
const log = require('node-wit').log;

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

// data layer init
const fixtures = require('./fixtures');

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = store.getSessions();

/** Helper function to send a Facebook Message */
const fbMessage = (id, message) => {
    const body = JSON.stringify({
        recipient: {id},
        message
    });
    const qs = 'access_token=' + encodeURIComponent(FB_PAGE_ACCESS_TOKEN);
    return fetch('https://graph.facebook.com/me/messages?' + qs, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body
    })
        .then(rsp => rsp.json())
        .then(json => {
            if (json.error && json.error.message) {
                throw new Error(json.error.message);
            }
            return json;
        });
};

const witActions = require('./wit-actions')(fbMessage, store.getSessions());


// Wit.ai parameters
const WIT_TOKEN = '5JI7XC4RZL2LBDC47LDBU5X443ZFEFYX';
// Setting up our bot
const wit = new Wit({
    accessToken: WIT_TOKEN,
    actions: witActions,
    logger: new log.Logger(log.INFO)
});


// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    res.send('Working!');
});

/** Facebook callback for verification */
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

/** Handle incoming messages */
app.post('/webhook/', function (req, res) {

    const data = req.body;

  // if (data.object === 'page') {
    console.warn('entry', data.entry)
    data.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message && !event.message.is_echo) {
          // Yay! We got a new message!
          // We retrieve the Facebook user 
        const sender = event.sender.id;

        const witSession = store.getSession(sender);

        console.log('JSON.stringify(event)', JSON.stringify(event));

          if (event.message) {

              // See if the message can be handled without WIT (e.g location sharing)
              const handled = handleStaticActions(event, fbMessage);
              console.log('handled', !!handled);
              if (handled) {
                  return handled.then(()=>{
                    res.sendStatus(200);
                  });
              }
              // Else, handle it with WIT
              else {
                  console.log('_____wit as seen these___')
                  // Let's forward the message to the Wit.ai Bot Engine
                  // This will run all actions until our bot has nothing left to do
                  wit.runActions(
                      witSession, // the user's current session
                      event.message.text, // the user's message
                      sessions[witSession].context // the user's current session state
                  ).then((context) => {
                      // Our bot did everything it has to do.
                      // Now it's waiting for further messages to proceed.
                      console.log('Waiting for next user messages');

                      // Based on the session state, you might want to reset the session.
                      // This depends heavily on the business logic of your bot.
                      // Example:
                      if (context['done']) {
                          delete sessions[witSession];
                      }

                      // Updating the user's current session state
                      sessions[witSession].context = context;
                  }).catch((err) => {
                      console.error('Oops! Got an error from Wit: ', err.stack || err);
                  });
              }
          }
  
        }
      })
    })
  // }
        
    res.sendStatus(200);
});

// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
});
