"use strict"
const userModel = require('../models/Users');

// ------------------------------------------------------------------------------------------------------------------------
// Controller com as ações do bot
// ------------------------------------------------------------------------------------------------------------------------
module.exports = {
	CheckFBUserExistence: function CheckFBUserExistence(objUser, idFB, callback) {
		try {
			userModel.FindOrCreate(objUser, idFB, function (result) {
				callback(result);
			});
		} catch (e) {
			callback(new Error(e.message));
		}
	}
}