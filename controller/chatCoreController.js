/// -----------------------------------------------------------------------------------------------------------
//	Controller com as funções e rotinas gerais usadas por todo o sistema
/// -----------------------------------------------------------------------------------------------------------
var objUser = require('./userController.js');
var objRoom = require('./roomController.js');
var util = require('util');
var fs = require('fs');
var jsMoment = require('moment');
var path = require('path');
var room, user;
var colors = require('colors');
// ------------------------------------------------------------------------------------------------------------
// Métodos que irão ficar públicos no escopo da aplicação quando houver o include deste arquivo.
// ------------------------------------------------------------------------------------------------------------
module.exports = {
	// --------------------------------------------------------------------------------------------------------
	// Quando o cliente conecta no servidor realiza as rotinas abaixo.
	// --------------------------------------------------------------------------------------------------------
	InitiateChat: function InitiateChat(socket, data, workPid, callback) {
		console.log('iniciateChat'.bgWhite.green);
		//console.dir(data);
		try {
			if (data.CodExterno) {
				data.socketId = socket.id;
				if (socket.state == socket.OPEN) {
					data.UserAgent = socket.request.headers['user-agent'];
					objUser.findOrInitialize(data, function (result) {
						user = result;
						data.UserStatus = user.UserStatus;
						socket.userId = user.Id;
						//console.log("Socket STATE = " + socket.state);
						socket.emit('authenticated', { userId: user.Id, userStatus: user.UserStatus });
						//console.log("Autenticou".bgWhite.green);
						ConfigUser(socket, user, data, workPid, function (result) {
							callback("Usuario iniciado com sucesso!");
						});
					});
				} else {
					//console.log("Socket disconectado!!!".bgWhite.red);
					socket.emit('unauthorized', { Resposta: "Estado do socket não estava OPEN!" });
				}
			} else {
				//console.log("Não veio com CodExterno no InitiateChat".bgWhite.red)
				socket.emit('unauthorized', { Resposta: "Não foi enviado o código do aluno" });
			}
		} catch (ex) {
			//callback(new Error(ex));
		}
	},
	// --------------------------------------------------------------------------------------------------------
	// Atualiza a lista de contatos. Quando um usuario entra em uma sala, é necessário re-enviar a lista
	// atualizada para todos os participantes da(s) sala(s) que o novo cliente está conectando. O mesmo ocorre
	// quando um cliente desconecta.
	// --------------------------------------------------------------------------------------------------------
	UpdateContactList: function UpdateContactList(user, socket, fullList, callback) {
		try {
			console.log("user: " + user);
			if (user) {
				var data = {};
				data.id = user.Id;
				data.Status = user.Status;
				if (fullList) {
					data.action = "contactList";
					objUser.findUsersByRoom(user.rooms, false, user.Id, function (result) {
						if (result && result.length > 0) {
							data.user = result;
							console.log(('Emitindo FULL-LIST para -> ' + user.Id).gray);
							//Primeiro envia para o usuario que está fazendo a ação todos os usuarios online de todas as salas dele
							//socket.exchange.publish(user.Id.toString(), data, function (err) {
							console.log('=====================================================================');
							console.log(socket.id);
							console.log('=====================================================================');
							socket.emit('contactList', data);
							data.action = "newUserOnline";
							data.user = user;
							for (var x = 0; x < user.rooms.length; x++) {
								//Depois envia para todas as salas (e seus usuarios) que o usuario da ação atual está online
								console.log(("Enviando a lista para sala: " + user.rooms[x] + ".").bgWhite.red);
								socket.exchange.publish(user.rooms[x], data, function (err) {
									console.log('Err : ' + err);
									console.log('X : ' + x + ' rooms.length: ' + user.rooms.length);

									if (err) {
										console.log("UpdateContactList falhou".red);
									}
									if (x >= (user.rooms.length - 1)) {
										console.log('Fez callback ');
										callback(true);
									}
								});
							}
						} else {
							callback(true);
						}
					});
				} else {
					console.log("user.Status: " + user.Status);
					if (user.Status == "Online") {
						data.action = "newUserOnline";
						//console.log("Emitindo user onLine".gray)
					} else {
						data.action = "newUserOffline";
						//console.log("Emitindo user offline".gray)
						//console.log(user).bgRed.white;
					}

					data.user = user;
					//console.dir(user);
					objRoom.FindRoomsByUser(user, function (results, metadata) {
						if (results && results.length > 0) {
							for (y in results) {
								console.log("Results[y].Id :" + results[y].Id);
								//console.log("Data:");
								//console.dir(data);
								//console.log("ccccccccccccccccccccccccccccccccccccccccccccccc");
								socket.exchange.publish(results[y].Id, data, function (err) {
									if (err) {
										//console.log("Erro ao enviar " + data.action);
									} else {
										//console.log(data.action + " enviada com sucesso!".green);
									}
								});
							}
							callback(true);
						} else {
							callback(true);
						}
					});
				}
			}
		} catch (ex) {
			return new Error(ex);
		};
	},
	// --------------------------------------------------------------------------------------------------------
	// Atualiza a lista de contatos. Quando um usuario entra em uma sala, é necessário re-enviar a lista
	// atualizada para todos os participantes da(s) sala(s) que o novo cliente está conectando. O mesmo ocorre
	// quando um cliente desconecta.
	// --------------------------------------------------------------------------------------------------------
	GetContactListByUser: function GetContactListByUser(userId, callback) {
		console.log('GetContactListByUser'.bgWhite.green);
		try {
			objUser.FindUserById(parseInt(userId, 10), function (usr) {
				if (usr) {
					if (usr.rooms) {
						objUser.findUsersByRoom(usr.rooms, true, function (result) {
							if (result && result.length > 0) {
								for (y in usr.rooms) {
									roomObj = objRoom.CheckIfRoomExists(usr.rooms[y]);
									for (x in result) {
										if (roomObj.users[result[x].Id]) {
											result[x].Status = 'Online';
										} else {
											result[x].Status = 'Offline';
										};
									};
								};
								callback(result);
							} else {
								callback("");
							}
						});
					};
				};
			});
		} catch (ex) {
			callback(new Error(ex));
		};
	},
	// --------------------------------------------------------------------------------------------------------
	// Entrega as informações do servidor
	// --------------------------------------------------------------------------------------------------------
	GetServerInfo: function GetServerInfo() {
		console.log('GetServerInfo'.bgWhite.green);
		try {
			var userCollection = objUser.GetUsersList();
			var svMemory = require('../server.js').getSvStartMemory();
			userCollection = (userCollection == null ? [] : userCollection);
			var returnInfo = { usersOnline: 0, roomQtd: 0, roomList: [], memoryUsed: 0, uptime: 0, userList: "", maxConnections: 0 };
			var memoryForObjects = (util.inspect(process.memoryUsage().rss) - svMemory) / 1024 / 1024;
			// ----------------------------------------------------------------------------------------------------
			for (x in userCollection) {
				if (userCollection[x].username) {
					returnInfo.userList += "," + userCollection[x].username
				}
			}
			// ----------------------------------------------------------------------------------------------------
			var maxConnections = require('./socketController.js').maxConnections();
			//
			returnInfo.userList = returnInfo.userList.substring(1).replace(/\,/g, '<br/>');
			returnInfo.memoryUsed = memoryForObjects.toFixed(2) + " MB's.";
			returnInfo.uptime = parseInt(util.inspect(process.uptime()), 10);
			returnInfo.usersOnline = objUser.GetUsersOnlineCount();
			returnInfo.roomQtd = objRoom.GetRoomsCount();
			returnInfo.roomList = objRoom.GetRoomsUserCount();
			returnInfo.maxConnections = maxConnections;
			// ----------------------------------------------------------------------------------------------------
			return returnInfo;
		} catch (ex) {
			return new Error(ex);
		};
	},
	// ----------------------------------------------------------------------------------------------------------------
	// Método retorna uma lista dos cookies existentes
	// ----------------------------------------------------------------------------------------------------------------
	ParseCookies: function ParseCookies(reqCookies) {
		console.log('ParseCookies'.bgWhite.green);
		try {
			var list = {}
			reqCookies && reqCookies.split(';').forEach(function (cookie) {
				var parts = cookie.split('=');
				list[parts.shift().trim()] = decodeURI(parts.join('='));
			});
			return list;
		} catch (ex) {
			return new Error(ex);
		};
	},
	// ----------------------------------------------------------------------------------------------------------------
	// Método envia as informações do servidor para o monitor (admin)
	// ----------------------------------------------------------------------------------------------------------------
	SendAdmServerInfo: function (io) {
		console.log('SendAdmServerInfo'.bgWhite.green);
		try {
			var admSocket = require('./socketController.js').admSocket();
			io.to(admSocket).emit('getServerInfo', this.GetServerInfo());
		} catch (ex) {
			return new Error(ex);
		};
	}
};

// ------------------------------------------------------------------------------------------------------------
// Configura o usuário que está conectando.
// ------------------------------------------------------------------------------------------------------------
function ConfigUser(socket, user, data, workPid, callback) {
	console.log('ConfigUser'.bgWhite.green);
	try {
		user.EmpresaId = data.Empresa;
		objUser.AddUserToList(user, socket.id, data.Rooms, function (result) {
			user = result;
			user.UserAgent = socket.request.headers['user-agent'];
			if (user.UltimaVezOnline) {
				user.UltimaVezOnline = user.UltimaVezOnline.toLocaleString();
			}
			//-----------------------------------------------------------------------
			objUser.UpdateStatus({ Id: user.Id, Status: 'Online', UserAgent: user.UserAgent, UserStatus: user.UserStatus }, function () {
				objUser.InsertUserSocket({ UsuarioId: user.Id, SocketId: socket.id, WorkPid: workPid }, function (result) {
					console.log("Gravou o socket".bgWhite.black);
					console.log("Exclui as salas do usuario que ele não faz mais parte")
					objRoom.DeleteOldRooms(user.rooms, user.Id, function () {
						console.log("Excluiu")
						console.log("SALAS -->")
						console.dir(user.rooms);
						console.log("SALAS <--")
						for (x in user.rooms) {
							console.log('Dentro do loop');
							console.log(x);
							objRoom.CheckIfRoomExists(user.rooms[x], function (room) {
								if (!room) {
									console.log('A sala não existia');
									objRoom.CreateRoom(user.rooms[x], user.EmpresaId, function (room) {
										console.log('A sala foi criada');
										objRoom.InsertRoomUser(user.rooms[x], user, function (result) { });
									});
								} else {
									console.log('A sala já existia');
									objRoom.InsertRoomUser(user.rooms[x], user, function (result) {
										console.log('O usuario foi inserido na sala');
									});
								}
							});
						}
						console.log('Fora do loop');
						console.log("Usuario inserido nas suas salas.".bgWhite.black);
						module.exports.UpdateContactList(user, socket, true, function () {
							console.log("Lista de usuarios Enviada!!".bgWhite.black);
							callback("OK");
						});
					});
				});
			});
		});
	} catch (ex) {
		console.log(new Error(ex));
	};
};

// ------------------------------------------------------------------------------------------------------------
// Construtor das mensagens do monitor.
// ------------------------------------------------------------------------------------------------------------
function MessageBuilder(type, data, me) {
	console.log('MessageBuilder'.bgWhite.green);
	try {
		// ---------------------------------------------------------------------------------------------------
		var msgType = type;
		var textInput = "";
		var dataAtual = new Date();
		var logTime = jsMoment(dataAtual).format('DD/MM/gg H:mm:ss');
		// ---------------------------------------------------------------------------------------------------
		var cstConnect = 0;
		var cstDisconnect = 1;
		var cstMessageSend = 2;
		var cstFileTransfer = 3;
		var cstFileAccept = 4;
		var cstFileCancel = 5;
		var cstTransferFinished = 6;
		var cstCall = 7;
		var cstAcceptCall = 8;
		var cstRefuseCall = 9;
		var cstGeneralInfo = 10;
		var cstMessage = 11;
		var cstFiles = 12;
		var cstCalls = 13;
		var cstErrors = 15;
		// ---------------------------------------------------------------------------------------------------
		switch (msgType) {
			case cstConnect:
				textInput = '÷ ' + cstGeneralInfo + '÷ ' + logTime + ' ÷ Usuário ' + me.username + ' conectou.';
				break;
			case cstDisconnect:
				textInput = '÷ ' + cstGeneralInfo + '÷ ' + logTime + ' ÷ Usuário ' + me.userid + ' desconectou.';
				break;
			case cstMessageSend:
				textInput = '÷ ' + cstMessage + '÷ ' + logTime + ' ÷ ' + me.Nome + ' enviou mensagem para ' + me.Nome + '.';
				if (data.msg) { textInput += '÷ Mensagem: ' + data.msg + ' \n' };
				break;
			case cstFileTransfer:
				textInput = '÷ ' + cstFiles + '÷ ' + logTime + ' ÷ Usuário ' + me.Nome + ' aceitou receber o arquivo.';
				if (data.name) { textInput += '÷ Arquivo: ' + data.name + '\n' };
				break;
			case cstFileAccept:
				textInput = '÷ ' + cstFiles + '÷ ' + logTime + ' ÷ Usuário ' + me.Nome + ' recebeu arquivo de ' + data.username + '.';
				if (data.fileName) { textInput += '÷ Arquivo: ' + data.fileName + '\n' };
				break;
			case cstFileCancel:
				textInput = '÷ ' + cstFiles + '÷ ' + logTime + ' ÷ Usuário ' + me.userid + ' cancelou a transferência do arquivo enviado por ' + data.remetente + '.';
				textInput += '÷ Arquivo: ' + data.fileName + ' \n';
				break;
			case cstTransferFinished:
				textInput = '÷ ' + cstFiles + '÷ ' + logTime + ' ÷ Arquivo enviado por ' + data.username + ' terminou de ser transferido para ' + me.Nome + '.';
				if (data.msg) { textInput += '÷ Arquivo: ' + data.msg + ' \n' };
				break;
			case cstCall:
				textInput = '÷ ' + cstCalls + '÷ ' + logTime + ' ÷ Usuário X está tentando iniciar uma chamada de vídeo com usuario Y.';
				//if (data.msg) { textInput += '÷ Arquivo: ' + data.msg + ' \n' }				;
				break;
			case cstAcceptCall:
				textInput = '÷ ' + cstCalls + '÷ ' + logTime + ' ÷ Usuário ' + data.username + ' aceitou a chamada de vídeo com: ' + me.username + '.';
				if (data.msg) { textInput += '÷ Arquivo: ' + data.msg + ' \n' };
				break;
			case cstRefuseCall:
				textInput = '÷ ' + cstCalls + '÷ ' + logTime + ' ÷ Usuário ' + data.username + ' não aceitou a chamada de vídeo com: ' + me.username + '.';
				if (data.msg) { textInput += '÷ Arquivo: ' + data.msg + ' \n' };
				break;
			default:
				break;
		};
		return textInput;
	} catch (ex) {
		return new Error(ex);
	};
}
// ----------------------------------------------------------------------------------------------------------------
// De acordo com o tipo de ação retorna a cor para ser usada no texto
// ----------------------------------------------------------------------------------------------------------------
function ColorParser(colorAction) {
	try {
		var cstGeneralInfo = 10;
		var cstMessage = 11;
		var cstFiles = 12;
		var cstCalls = 13;
		var cstErrors = 15;
		var returnColor = "";
		switch (colorAction) {
			case cstGeneralInfo:
				returnColor = "#78ff00"; break;
			case cstMessage:
				returnColor = "#fffcc4"; break;
			case cstFiles:
				returnColor = "#36c8ff"; break;
			case cstCalls:
				returnColor = "#9436ff"; break;
			case cstErrors:
				returnColor = "#BD0000"; break;
			default:
				returnColor = "#fffcc4"; break;
		};
		return returnColor;
	} catch (ex) {
		return new Error(ex);
	};
}
// ----------------------------------------------------------------------------------------------------------------
// Monta o HTML que será exibido no sistema de monitoramento
// ----------------------------------------------------------------------------------------------------------------
function ParseLogToHtml(txtLine) {
	try {
		if (txtLine) {
			var lineType = parseInt(txtLine.split('÷')[1], 10) || 0;
			var dateTime = txtLine.split('÷')[2] || "";
			var info = txtLine.split('÷')[3] || "";
			var detail = txtLine.split('÷')[4] || "";
			var htmlReturn = "";
			var defaultColor = "#FFF";
			var infoDetailColor = ColorParser(lineType);
			// ----------------------------------------------------------------------------------------------------
			htmlReturn = '<b>' + dateTime + '</b>' + '<span style="color:' + infoDetailColor + ';">' + info + '</span>';
			htmlReturn += '<span style="color:' + infoDetailColor + '; font-style: italic;">' + detail + '</span>';
			// ----------------------------------------------------------------------------------------------------
			return htmlReturn;
		} else {
			return null;
		}
	} catch (ex) {
		return new Error(ex);
	};
}
