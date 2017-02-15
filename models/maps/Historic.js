'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Historic', {
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
		EventoId: {
			type: Sequelize.INTEGER,
			model: 'Eventos',
			key: 'Id'
		},
		From: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'From'
		},
		To: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'To'
		},
		Details: {
			type: Sequelize.STRING,
			allowNull: false,
			field: 'Details'
		},
		MsgDate: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
			allowNull: false,
			field: 'MsgDate'
		},
		Readed: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			field: 'Readed'
		},
		ReadedDate: {
			type: Sequelize.DATE,
			allowNull: true,
			field: 'DataLido'
		},
		FromFacebook: {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			field: 'FromFacebook'
		},
	}, {
			freezeTableName: true,
			timestamps: false
	});
}