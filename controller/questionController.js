"use strict"
var questionModel = require('../models/Questions.js').Question;
// ------------------------------------------------------------------------------------------------------------------------
module.exports = {
	// --------------------------------------------------------------------------------------------------------------------
	// Get all items
	// --------------------------------------------------------------------------------------------------------------------
	GetAll: function GetAll(productId, cb) {
		var objItem = new questionModel();
		objItem.GetAllInstances(productId, function (result) {
			cb(result);
		});
	},
	// --------------------------------------------------------------------------------------------------------------------
	// Get a item by name
	// --------------------------------------------------------------------------------------------------------------------
	GetQuestionBySubject: function GetQuestionBySubject(subjectItem, cb) {
		var objItem = new questionModel();
		objItem.GetItemBySubject(subjectItem, function (result) {
			cb(result);
		});
	},
	// --------------------------------------------------------------------------------------------------------------------
	// Get a item by id
	// --------------------------------------------------------------------------------------------------------------------
	GetItemById: function GetItemById(idItem, cb) {
		var objItem = new questionModel();
		objItem.FindById(idItem, function (result) {
			cb(result);
		});
	},
	// --------------------------------------------------------------------------------------------------------------------
	// Save
	// --------------------------------------------------------------------------------------------------------------------
	Save: function Save(jsonData, cb) {
		try {
			var objItem = new questionModel();
			//objItem.ProductId = jsonData.ProductId;
			//objItem.Name = jsonData.Name;
			objItem.Save(function (result) {
				cb(result);
			});
		} catch (e) {
			cb(new Error(e.message));
		}
	},
	// --------------------------------------------------------------------------------------------------------------------
	// Save the new Item
	// --------------------------------------------------------------------------------------------------------------------
	Delete: function Delete(idItem, cb) {
		try {
			var objItem = new questionModel();
			objItem.Id = idItem;
			objItem.Delete(function (result) {
				cb(result);
			});
		} catch (e) {
			cb(new Error(e.message));
		}
	},
	// --------------------------------------------------------------------------------------------------------------------
	// Update Item
	// --------------------------------------------------------------------------------------------------------------------
	Update: function Update(jsonData, idInstance, cb) {
		try {
			var objInstance = new questionModel();
			//objInstance.idInstance = idInstance;
			//objInstance.ProductId = jsonData.ProductId;
			objInstance.Save(function (result) {
				cb(result);
			});
		} catch (e) {
			cb(new Error(e.message));
		}
	}
}