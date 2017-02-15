'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Classifier', {
		Id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			validate: {
				isInt: true
			},
			field: 'Id'
		},
		Title: {
			type: Sequelize.STRING(100),
			allowNull: false,
			field: 'Title'
		},
		Description: {
			type: Sequelize.STRING(1000),
			allowNull: false,
			field: 'Description'
		},
	}, {
		freezeTableName: true,
		timestamps: false
	});
}
