'use strict'
/// -------------------------------------------------------------------------------------------
var _ = require('underscore');
var DBMap = require('../controller/databaseController').models.Events;
/// -------------------------------------------------------------------------------------------
class Event {
	constructor() {
		this.Id = 0;
		this.Nome = "";
		this.db = DBMap;
	}
	/// ---------------------------------------------------------------------------------------
	/// Salva a instancia do objeto no banco de dados
	/// Retorna o objeto inserido no banco
	/// ---------------------------------------------------------------------------------------
	Save(cb) {
		try {
			var objInstance = this;
			delete objInstance.db;
			this.db.create(objInstance).then(function (result) {
				cb(results);
			});
		} catch (ex) {
			cb(new Error(ex));
		}
	}
	/// ---------------------------------------------------------------------------------------
	/// Atualiza a instancia do objeto no banco de dados
	/// Retorna a quantidade de registros alterados
	/// ---------------------------------------------------------------------------------------
	Update(cb) {
		try {
			var jsonData = {};
			_.each(this, function (value, key) {
				if (key !== "db")
					jsonData[key] = value;
			});
			this.db.update(jsonData, { where: { "Id": this.Id } }).then(function (result) {
				cb(result[0]);
			});
		} catch (ex) {
			cb(new Error(ex));
		}
	}
	/// ---------------------------------------------------------------------------------------
	/// Atualiza a instancia do objeto no banco de dados
	/// Retorna a quantidade de registros alterados
	/// ---------------------------------------------------------------------------------------
	Delete(cb) {
		try {
			this.db.destroy({ where: { "Id": this.Id } }).then(function (result) {
				cb(result[0]);
			});
		} catch (ex) {
			cb(new Error(ex));
		}
	}
	/// ---------------------------------------------------------------------------------------
	/// FindById
	/// Retorna os dados pelo Id
	/// ---------------------------------------------------------------------------------------
	FindById(idObj, cb) {
		try {
			var _this = this;
			this.db.findById(idObj).then(function (result) {
				if (result != null) {
					_.each(result.dataValues, function (value, key) {
						_this[key] = value;
					});
					cb(_this);
				} else {
					cb(_this);
				}
			});
		} catch (ex) {
			cb(new Error(ex));
		}
	}
	/// ---------------------------------------------------------------------------------------
	/// GetAllInstances
	/// Retorna um array de todos os itens cadastrados
	/// ---------------------------------------------------------------------------------------
	GetAllInstances(cb) {
		try {
			var _this = this;
			this.db.findAll({ raw: true }).then(function (result) {
				cb(result);
			});
		} catch (ex) {
			cb(new Error(ex));
		}
	}
}
/// -------------------------------------------------------------------------------------------
exports.Event = Event;