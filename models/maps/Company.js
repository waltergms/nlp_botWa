'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Company', {
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
			field: 'Name'
		},
		UrlOrigin: {
			type: Sequelize.STRING(250),
			allowNull: false,
			field: 'UrlOrigin'
		},
		Token: {
			type: Sequelize.STRING(200),
			allowNull: false,
			field: 'Token'
		},
		ChatEnabled: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			field: 'Chat'
		},
		HistoricEnabled: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			field: 'HistoricEnabled'
		},
		TransferEnabled: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			field: 'TransferEnabled'
		},
		ConferenceEnabled: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			field: 'ConferenceEnabled'
		},
		LogFileEnabled: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			field: 'LogFileEnabled'
		}
	}, {
		freezeTableName: true,
		timestamps: false
	});
}