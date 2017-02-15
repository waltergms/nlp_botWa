"use strict"
var classifierModel = require('../models/Classifiers.js').Classifier;
// ------------------------------------------------------------------------------------------------------------------------
module.exports = {
	// --------------------------------------------------------------------------------------------------------------------
	// Get all items
	// --------------------------------------------------------------------------------------------------------------------
	GetAll: function GetAll(productId, cb) {
		var objItem = new classifierModel();
		objItem.GetAllInstances(productId, function (result) {
			cb(result);
		});
	},
	// --------------------------------------------------------------------------------------------------------------------
	// Get a item by name
	// --------------------------------------------------------------------------------------------------------------------
	GetItemByName: function GetItemByName(ItemName, cb) {
		var objItem = new classifierModel();
		objItem.GetItemByName(ItemName, function (result) {
			cb(result);
		});
	},
	// --------------------------------------------------------------------------------------------------------------------
	// Get a item by id
	// --------------------------------------------------------------------------------------------------------------------
	GetItemById: function GetItemById(idItem, cb) {
		var objItem = new classifierModel();
		objItem.FindById(idItem, function (result) {
			cb(result);
		});
	},
	// --------------------------------------------------------------------------------------------------------------------
	// Save
	// --------------------------------------------------------------------------------------------------------------------
	Save: function Save(jsonData, cb) {
		try {
			var objItem = new classifierModel();
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
			var objItem = new classifierModel();
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
			var objInstance = new classifierModel();
			//objInstance.idInstance = idInstance;
			//objInstance.ProductId = jsonData.ProductId;
			objInstance.Save(function (result) {
				cb(result);
			});
		} catch (e) {
			cb(new Error(e.message));
		}
	},
	// --------------------------------------------------------------------------------------------------------------------
	// Get all items
	// --------------------------------------------------------------------------------------------------------------------
	GetClassifiersWithWords: function GetClassifiersWithWords(classifierKey, cb) {
		var objItem = new classifierModel();
		objItem.GetClassifiersWithWords(classifierKey, function (result) {
			cb(result);
		});
	},
}