'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const textrazor = require('./text-analysis');

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    textrazor('Transfer 100 $ to Vlad Nicula', function (operation, money, people) {
        res.send(`
The operation to do is: ${operation}.
Sum & currency: ${money[0].sum} ${money[0].currency}.
People involved: ${people}
`);
    });
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

function sendTextMessage(sender, text) {
    let messageData = {text: text};
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: FB_PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
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
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        if (event.message && event.message.text) {
        	const coordinates = event.message.attachments.payload.coordinates;
            let text = event.message.text;
            try {
				textrazor(text, function (operation, money, people) {
const message = `
The operation to do is: ${operation}.
Sum & currency: ${money[0].sum} ${money[0].currency}.
People involved: ${people}
`;
				
					sendTextMessage(sender, message.substring(0, 200));
	            });
			}	
            catch (err) {
            	console.log('textrazor err', err);
            	sendTextMessage(sender, 'Huston, we have a problem: '+err.toString());
            }


        }
    }
    res.sendStatus(200)
});

// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
});

const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;