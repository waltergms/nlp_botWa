'use strict'
//
// USERSTATUS = 0 -> ONLINE | 1 -> OCUPADO | 2 -> AUSENTE | 3 -> INVISIVEL 
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('User', {
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
		CompanyId: {
			type: Sequelize.INTEGER,
			model: 'Company',
			key: 'Id'
		},
		LegacyId: {
			type: Sequelize.STRING(50),
			field: 'LegacyId'
		},
		Name: {
			type: Sequelize.STRING(100),
			allowNull: false,
			field: 'Name'
		},
		Avatar: {
			type: Sequelize.STRING(300),
			allowNull: false,
			field: 'Avatar'
		},
		LastTimeOnline: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
			allowNull: false,
			field: 'LastTimeOnline'
		},
		UserAgent: {
			type: Sequelize.STRING(300),
			allowNull: true,
			field: 'UserAgent'
		},
		UserStatusId: {
			type: Sequelize.INTEGER,
			model: 'UserStatus',
			key: 'Id'
		},
		FBPageId: {
			type: Sequelize.STRING(100),
			allowNull: true,
			field: 'FBPageId'
		},
		FBMessengerId: {
			type: Sequelize.STRING(100),
			allowNull: true,
			field: 'FBMessengerId'
		},
	}, {
		freezeTableName: true,
		timestamps: true,
		createdAt: false,
		updatedAt: 'LastTimeOnline'
	});
}