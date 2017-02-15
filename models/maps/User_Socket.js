'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('User_Socket', {
		UserId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			validate: {
				isInt: true
			},
			field: 'UserId'
		},
		SocketId: {
			type: Sequelize.STRING(100),
			allowNull: false,
			field: 'SocketId'
		},
		WorkPid: {
			type: Sequelize.INTEGER,
			allowNull: false,
			field: 'WORKPID'
		},
		ServerAddress: {
			type: Sequelize.STRING,
			field: 'ServerAddress'
		}
	}, {
			freezeTableName: true,
			timestamps: false
	});
}
