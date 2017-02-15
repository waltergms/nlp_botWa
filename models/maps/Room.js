'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Room', {
		Id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			allowNull: false,
			validate: {
				isInt: true
			},
			field: 'Id'
		},
		CompanyId: {
			type: Sequelize.INTEGER,
			model: 'Company',
			key: 'Id'
		},
		CreatedAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
			allowNull: false,
			field: 'CreatedAt'
		}
	}, {
			freezeTableName: true,
			timestamps: false
	});
}