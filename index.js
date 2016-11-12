'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
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

        const session = persistenceService.getSessionOfUserId(sender);

        if ( session.flowState !== null ) {
        	console.log('should handle special flow case, not beginning of new flow');
        }

        console.log('JSON.stringify(event)', JSON.stringify(event));

        if ( event.message ) {
            const response = parser(event);
            sendTextMessage(sender, response);
        }
    }
    res.sendStatus(200);
});

// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
});

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;