'use strict'
const fs = require('fs');
const http = require('http');
const https = require('spdy');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const rClassifier = require('./routes/classifier');
const rWebhook = require('./routes/webhook');
const rIndex = require('./routes/index');
const path = require('path');

const privateKey = fs.readFileSync(path.join(__dirname, './certs/wabot.webaula.com.br.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, '/certs/472164dc9972e192.crt'), 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
    ca: [fs.readFileSync(path.join(__dirname, '/certs/gd_bundle-g2-g1.crt'), 'utf8'),
		fs.readFileSync(path.join(__dirname, '/certs/gd-class2-root.crt'), 'utf8')]
};
const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Process application/json
app.use(bodyParser.json())

/// ------------------------------------------------
/// Adição das rotas / Endpoints da aplicação no app
/// ------------------------------------------------
app.use('/classifier', rClassifier);
app.use('/webhook', rWebhook);
app.use('/', rIndex);

/// ------------------------------------------------
//app.set('port', (process.env.PORT || 5000));
app.set('port', 442);
/// ------------------------------------------------
//var server = app.listen(app.get('port'), function () {
//	console.log('Express server listening on port ' + server.address().port);
//});

//httpServer.listen(3005);
//httpsServer.listen(442, function () {
//	console.log('Express server listening on port ' + httpsServer.address().port);
//});

httpServer.listen(442, function () {
	console.log('Express server listening on port ' + httpServer.address().port);
});


