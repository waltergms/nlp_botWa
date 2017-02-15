'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Classifier_Word', {
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
		WordId: {
			type: Sequelize.INTEGER,
			model: 'Word',
			key: 'Id',
			allowNull: false,
			field: 'WordId'
		},
	}, {
			freezeTableName: true,
			timestamps: false
		});
}
