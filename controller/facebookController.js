'use strict';
// ------------------------------------------------------------
const request = require('request')
const token = "EAAFVIxhFZCpQBAMdyUlywlYKKxdI4K5vRUt6b9cGv5vpC1OiKU0eRy9v4HrJ0ksZBSZC0lrQmqYYlsH04GZAuVNVSkmPjjp1PJejOnUAYkGVpAH4ghREMI48XJeSKEk9YArE0ooxkGcRtJOkOxhrx9VyzuxVululsqSI8tfPRgZDZD"
const myToken = "w@T0k3nCh@tb0t";
const myUserId = "330091654029846";
// ------------------------------------------------------------
module.exports = {
	sendTextMessage: function sendTextMessage(sender, text) {
		let messageData = { "text": text }
		request({
			url: 'https://graph.facebook.com/v2.8/me/messages',
			qs: { access_token: token },
			method: 'POST',
			json: {
				recipient: { id: sender },
				message: messageData,
			}
		}, function (error, response, body) {
			if (error) {
				//console.log('Error sending messages: ', error)
			} else if (response.body.error) {
				//console.log('Error: ', response.body.error)
			}
		})
	},
	// ------------------------------------------------------------
	sendGenericMessage: function sendGenericMessage(sender, itens) {
		let messageData = {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"elements": []
				}
			}
		}
		itens.forEach(function (value, index) {
			messageData.attachment.payload.elements.push(JSON.parse(
			`{
			"title": "${value.label} - ${index + 1}ª opção",
			"subtitle": "${value.label} - ${index + 1}ª opção de escolha",
			"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
			"buttons": [{
				"type": "postback",
				"title": "${value.label}",
				"payload": "${value.label}"
				}]
			}`));
		});
	sendToFacebook(sender, messageData);
	},
	// ------------------------------------------------------------
	sendListMessage: function sendListMessage(sender, itens) {
		let messageData = {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "list",
					"elements": [],
					"buttons": [{
						"title": "View More",
						"type": "postback",
						"payload": "payload"
					}]
				}
			}
		}
		itens.forEach(function (value, index) {
			messageData.attachment.payload.elements.push(JSON.parse(
			`{
            "title": "${value.label}",
            "image_url": "https://peterssendreceiveapp.ngrok.io/img/white-t-shirt.png",
            "subtitle": "100% Cotton, 200% Comfortable",
            "default_action": {
                "type": "web_url",
                "url": "https://peterssendreceiveapp.ngrok.io/view?item=10${index}",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
            },
            "buttons": [
					{
						"title": "${value.label}",
						"type": "web_url",
						"url": "https://peterssendreceiveapp.ngrok.io/shop?item=10${index}",
						"messenger_extensions": true,
						"webview_height_ratio": "tall",
						"fallback_url": "https://peterssendreceiveapp.ngrok.io/"                        
					}
				]                
			}`));
		});
		sendToFacebook(sender, messageData);
	},

	getUserInfo(sender, callback) {
		let url = sender + `?first_name,last_name,gender,locale,is_payment_enabled,profile_pic,timezone&access_token=${token}`;
		//console.log(`https://graph.facebook.com/v2.8/${url}`);
		request({
			url: `https://graph.facebook.com/v2.8/${url}`,
			method: 'GET',
			json: true,
		}, function (error, response, body) {
			if (error) {
				//console.log('Error sending messages: ', error)
			} else if (response.body.error) {
				//console.log('Error: ', response.body.error)
			} else {
				callback(body);
			}
		})
	},

	sendQuickOptions: function sendQuickOptions(sender, itens, iteraction){
		let messageData = {
			"text": "Selecione a opção que melhor atende sua dúvida:",
			"quick_replies": []
		}
		itens.forEach(function (value, index) {
			messageData.quick_replies.push(JSON.parse(
				`{
					"content_type": "text",
					"title": "${value.label}",
					"payload": "Item:${value.label}|Sender:${sender}|Iteraction:${iteraction++}"
				}`
			));
		});
		sendToFacebook(sender, messageData);
		module.exports.sendUserAction('S', sender, function () { })
	},

	sendUserAction: function sendUserAction(typeAction, sender, callback) {
		try {
			let Action = null;
			switch(typeAction) {
				case 'R': // Readed message - Mensagem Lida
					Action = 'mark_seen';
					break;
				case 'T': // Typing - Digitando
					Action = 'typing_on';
					break;
				case 'S': // Stop typing - Parou de digitar
					Action = 'typing_off';
					break;
				default:
					Action = 'typing_off';
					break;
			}
			let messageData = {
				"recipient": {
					"id": sender
				},
				"sender_action": Action
			}
			request({
				url: `https://graph.facebook.com/v2.8/me/messages?access_token=${token}`,
				qs: { access_token: token },
				method: 'POST',
				json: messageData
			}, function (error, response, body) {
				if (error) {
					//console.log('Error sending messages: ', error)
				} else if (response.body.error) {
					//console.log('Error: ', response.body.error)
				} else {
					callback("OK");
				}
			})
		} catch (e) {

		}
	}
}

function sendToFacebook(sender, messageData){
	request({
		url: `https://graph.facebook.com/v2.8/me/messages?access_token=${token}`,
		qs: { access_token: token },
		method: 'POST',
		json: {
			recipient: { id: sender },
			message: messageData,
		}
	}, function (error, response, body) {
		if (error) {
			//console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			//console.log('Error: ', response.body.error)
		}
	})
}
