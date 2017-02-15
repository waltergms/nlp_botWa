'use strict'
/// -------------------------------------------------------------------------------------------
var _ = require('underscore');
var DBMap = require('../controller/databaseController').models.Historic;
/// -------------------------------------------------------------------------------------------
class Historical {
	constructor() {
		this.Id = 0;
		this.EventoId = 0;
		this.From = 0;
		this.To = 0;
		this.Details = '';
		this.MsgDate = new Date();
		this.Readed = 0;
		this.ReadedDate = new Date();
		this.FromFacebook = 0;
		this.db = DBMap;
	}
	/// ---------------------------------------------------------------------------------------
	/// Salva a instancia do objeto no banco de dados
	/// Retorna o objeto inserido no banco
	/// ---------------------------------------------------------------------------------------
	Save(cb) {
		try {
			var objInstance = _.clone(this);
			delete objInstance.db;
			if (objInstance.FromFacebook === 1) {
				var strSQL = `INSERT INTO Historic VALUES(
				(Select Id from User where FBMessengerId = '${objInstance.From}'),
				(Select Id from User where FBMessengerId = '${objInstance.To}'),
				'${objInstance.Details}',
				'${objInstance.MsgDate}',
				1,
				'${objInstance.ReadedDate}',
				1,
				1)`;
				this.db.sequelize.query(strSQL).spread(function (results, metadata) {
					callback(results);
				});
			} else {
				this.db.create(objInstance).then(function (result) {
					cb(results);
				});
			}
				
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
exports.Historical = Historical;