'use strict'
var Sequelize = require('sequelize');
//
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Room_User', {
        RoomId: {
            type: Sequelize.INTEGER,
            model: 'Room',
            key: 'Id'
        },
        UserId: {
            type: Sequelize.INTEGER,
            model: 'User',
            key: 'Id'
        },
        CompanyId: {
            type: Sequelize.INTEGER,
            model: 'Company',
            key: 'Id'
        },
    }, {
            freezeTableName: true,
            timestamps: false
    });
}