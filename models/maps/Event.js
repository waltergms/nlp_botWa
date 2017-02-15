'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Event', {
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
		Name: {
			type: Sequelize.STRING(100),
			allowNull: false,
			field: 'Nome'
		}
	}, {
			freezeTableName: true,
			timestamps: false
		});
}
