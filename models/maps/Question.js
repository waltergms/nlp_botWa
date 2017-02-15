'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Question', {
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
		ClassifierId: {
			type: Sequelize.INTEGER,
			model: 'Classifier',
			key: 'Id',
			allowNull: false,
			field: 'ClassifierId'
		},
		Question: {
			type: Sequelize.STRING(2000),
			allowNull: false,
			field: 'Question'
		},
	}, {
		freezeTableName: true,
		timestamps: false
	});
}
