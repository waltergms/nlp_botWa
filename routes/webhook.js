'use strict'
const express = require('express');
const router = express.Router();
const token = "EAAFVIxhFZCpQBAMdyUlywlYKKxdI4K5vRUt6b9cGv5vpC1OiKU0eRy9v4HrJ0ksZBSZC0lrQmqYYlsH04GZAuVNVSkmPjjp1PJejOnUAYkGVpAH4ghREMI48XJeSKEk9YArE0ooxkGcRtJOkOxhrx9VyzuxVululsqSI8tfPRgZDZD"
const myToken = "w@T0k3nCh@tb0t";
const fbCtrl = require('../controller/facebookController');
const botCtrl = require('../controller/botController');
const graph = require('fbgraph');
const request = require('request')

// for Facebook verification
router.get('/', function (req, res) {
	if (req.query['hub.verify_token'] === myToken) {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

router.post('/sendMessageFromOuterWorld/:idRecipient', function (req, res) {
	let idRecipient = req.params.idRecipient;
	let Message = req.body.Message;
	fbCtrl.sendTextMessage(idRecipient, Message);
});

router.post('/', function (req, res) {
	botCtrl.InitialInteraction(req.body, function (result) {
		res.sendStatus(200)
	});
});

router.post('/teste', function (req, res) {
	botCtrl.PostTyping('940887249350023');
	res.status(200).send('OK');
});


function sendTextMessage(sender, text) {
    let messageData = { text: text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

module.exports = router;