'use strict'
const Historic = require('../models/Historical').Historical;
const userCtrl = require('./userController');
// ------------------------------------------------------------------------------------------------------------------------
// Controller com as ações do bot
// ------------------------------------------------------------------------------------------------------------------------
module.exports = {
	BuildHistoric: function (objInfo, platform, callback) {
		let messageHist = new Historic();
		switch (platform) {
			case 'fbMessenger':
				userCtrl.CheckFBUserExistence(objInfo, objInfo.Sender, function (result) {
					userCtrl.CheckFBUserExistence(objInfo, objInfo.Recipient, function (result) {
						messageHist.EventoId = 1;
						messageHist.From = objInfo.Sender;
						messageHist.To = objInfo.Recipient;
						messageHist.FromFacebook = 1;
						messageHist.Details = objInfo.Text;
						messageHist.MsgDate = Date.now();
						messageHist.Readed = 1;
						messageHist.ReadedDate = Date.now();
						messageHist.Save(function (result) {
							callback(result);
						});
					});
				});
			case 'chatMessenger':
				messageHist.EventoId = 1;
				messageHist.From = objInfo.Sender;
				messageHist.To = objInfo.Recipient;
				messageHist.FromFacebook = 0;
				messageHist.Details = objInfo.Text;
				messageHist.MsgDate = Date.now();
				messageHist.Readed = 1;
				messageHist.ReadedDate = Date.now();
				messageHist.Save(function (result) {
					callback(result);
				});
			default:
		}
	}
}
