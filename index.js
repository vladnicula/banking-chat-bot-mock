var express = require('express');

var app = express();

app.get('/', (req, res) => {
	res.send('ok');
})

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'i-am-the-danger') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

var port = process.env.PORT || 8080;

app.listen(port, function () {
	console.log('listening on', port);
});