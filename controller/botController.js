"use strict"
const aiCtrl = require('./aiController');
const classifierCtrl = require('./classifierController');
const questionCtrl = require('./questionController');
const fbCtrl = require('./facebookController');
const History = require('./historicController');
const natural = require('natural');
const path = require('path');
const keyword_extractor = require("keyword-extractor");
var classifier;
natural.BayesClassifier.load(path.join(__dirname, '../classifier.json'), natural.PorterStemmerPt, function (err, classifierResult) {
	classifier = classifierResult;
});
// ------------------------------------------------------------------------------------------------------------------------
// Controller com as ações do bot
// ------------------------------------------------------------------------------------------------------------------------
module.exports = {
	InitialInteraction: function (fbBody, callback) {
		let messaging_events = fbBody.entry[0].messaging
		if (messaging_events){
			for (let i = 0; i < messaging_events.length; i++) {
				let event = fbBody.entry[0].messaging[i]
				let sender = event.sender.id
				let recipient = event.recipient.id;
				if (event.message && event.message.text) {
					let text = event.message.text
					if (sender != '330091654029846') {
						module.exports.PostTyping(sender);
						fbCtrl.getUserInfo(sender, function (result) {
							fbCtrl.sendTextMessage(sender, 'Olá ' + result.first_name + ', tudo bem? Em que posso lhe ajudar?');
							History.BuildHistoric({
								"Sender": sender,
								"Recipient": recipient,
								"Text": text
							}, 'fbMessenger', function (result) {
								console.log('historico salvo');
							});
							callback('ok');
						});
					} else {
						console.log('send from bot');
						console.dir(event.message);
						callback('ok');
					}
				} else {
					callback('ok');
				}
			}
		} else {
			callback('ok');
		}
	},
	PostBackInteraction : function(sender, text, callback) {
		fbCtrl.sendTextMessage(sender, text);
		module.exports.PostStopTyping(sender);
		callback;
	},
	PostBackSubjectQuestions: function (sender, text, iteraction, callback) {
		let subject = text.substr(3, text.length);
		questionCtrl.GetQuestionBySubject(subject, function (result) {
			fbCtrl.sendQuickOptions(sender, result.dataValues, 2, function () {
				module.exports.PostStopTyping(sender);
				callback;
			});
		});
	},

	PostMsgReaded: function PostMsgReaded(sender) {
		fbCtrl.sendUserAction('R', sender, function (result) {
			//console.log(result);
		});
	},

	PostTyping: function PostTyping(sender) {
		fbCtrl.sendUserAction('T', sender, function (result) {
			//console.log(result);
		});
	},

	PostStopTyping: function PostTyping(sender) {
		fbCtrl.sendUserAction('S', sender, function (result) {
			//console.log(result);
		});
	}
}