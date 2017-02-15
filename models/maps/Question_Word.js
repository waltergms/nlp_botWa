'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Question_World', {
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
		QuestionId: {
			type: Sequelize.INTEGER,
			model: 'Question',
			key: 'Id',
			allowNull: false,
			field: 'QuestionId'
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
