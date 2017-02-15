'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('UserStatus', {
		Id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			allowNull: false,
			validate: {
				isInt: true
			},
			field: 'Id'
		},
		Name: {
			type: Sequelize.STRING(20),
			allowNull: false,
			field: 'Name'
		},
	}, {
			freezeTableName: true,
			timestamps: false
	});
}