'use strict'
var socketio = require('socket.io');
var redis = require('socket.io-redis');
var io;
// ------------------------------------------------------------------------------------------------------------
exports.listen = function (server) {
	// recebe o servidor
	io = socketio.listen(server);
	//
	io.adapter(redis({ host: '192.168.118.166', port: 6379 }));
	// Intervalo para o ping que checa se o socket continua ativo
	io.engine.pingInterval = 30;
	// Seta o maxListeners para ilimitado. (Quantidade de sockets conectados simultaneamente.)
	io.sockets.setMaxListeners(0);
	// Array para controle da transferência de arquivos
	var Files = [];
	// ----------------------------------------------------------------------------------------------------
	// Após o socket conectar-se ao servidor aqui é iniciado a entrada do usuario no chat
	// ----------------------------------------------------------------------------------------------------
	socket.on('authentication', function (data) {
		try {
			console.log("1 - Authentication".bgWhite.green.bold);
			objCore.InitiateChat(this, data, workPid, function (result) {
				console.log(result);
			});
		} catch (ex) {
			return new Error(ex);
		}
	});
	// ----------------------------------------------------------------------------------------------------
	// Controles e funções para desconectar o usuário e avisar aos outros que ele desconectou-se
	// ----------------------------------------------------------------------------------------------------
	socket.on('disconnect', function () {
		console.log("2 - Disconectou".bgRed.white.bold);
		var userId = socket.userId; //this.subscriptions()[0];
		if (userId) {
			objUser.FindUserById(parseInt(userId, 10), function (user) {
				var jsonSocket = { UsuarioId: user.Id, SocketId: socket.id };
				objUser.FindUserSocket(jsonSocket, function (result) {
					if (result.count > 1) {
						socket.kickOut();
						objUser.RemoveUserSocket(jsonSocket, function (result) {
							console.log("removeu o socket " + socket.id);
						});
					} else {
						//-----------------------------------------------------------------
						console.log("3 - Disconectou".bgYellow.black.bold);
						user.Status = 'Offline';
						objCore.UpdateContactList(user, socket, false, function (result) {
							socket.kickOut();
						});
						//-----------------------------------------------------------------
						objUser.UpdateStatus({ Id: user.Id, Status: 'Offline' }, function (result, metadata) {
							objUser.RemoveUserSocket({ UsuarioId: user.Id }, function (result) { });
						});
					}
				});
			}, function (Id) { console.log('User com Id: ' + Id + ' não encontrado.'); });
		}
		global.gc();
	});
	// ----------------------------------------------------------------------------------------------------
	// Envio de mensagens
	// ----------------------------------------------------------------------------------------------------
	socket.on('sendMessage', function (data, fn) {
		if (data && data.msg) {
			if (data.msg.replace(/\s/g, '') != "") {
				objUser.FindUserById(parseInt(data.receiver, 10), function (usr) {
					var dtNow = Moment().format('YYYY-MM-DD HH:mm:ss:SSS');
					var eventoNum = 0;
					//
					if (data.type == 'chat') {
						eventoNum = 1;
						data.action = "startChat";
					} else if (data.type == 'file') {
						eventoNum = 2;
						data.action = "startChat";
					} else if (data.type == 'video') {
						eventoNum = 3;
						data.action = "conference";
					}
					// Monta os dados para insert na tabela de históricos
					var historicData = {
						EventoId: eventoNum,
						De: parseInt(data.from, 10),
						Para: parseInt(data.receiver, 10),
						Detalhes: data.msg.toString() || '',
						DataHora: dtNow,
						EmpresaId: 2
					};
					//
					data.timeStamp = dtNow;
					//
					if (usr == undefined) {
						if (eventoNum == 1) {
							//console.log('-----------------------------------------------------------');
							//console.log('333');
							//console.log('-----------------------------------------------------------');
							objHistorico.InsertHistoric(historicData, function (id) { });
						}
					} else {
						// Se está ONLINE
						// Grava a mensagem e a envia para o(s) destinatario(s)
						//console.log('-----------------------------------------------------------');
						//console.log('444');
						//console.log('-----------------------------------------------------------');
						objHistorico.InsertHistoric(historicData, function (id) {
							data.idMsg = id;
							socket.exchange.publish(data.receiver.toString(), data, function (err) {
								if (err) {
									//console.log("Publish falhou".bgRed.white.bold);
									if (fn) {
										fn("Publish falhou!");
									}
								} else {
									//console.log("Publish emitido para " + data.receiver.toString());
									//console.dir(data);
								}
							});
						});
						//console.log('Mensagem enviada'.bgBlue.white);
					}
				})
			}
		}
	});
	// ----------------------------------------------------------------------------------------------------
	// Atualiza o histórico para informar que a mensagem foi lida.
	// ----------------------------------------------------------------------------------------------------
	socket.on('MessageRead', function (idMessage) {
		try {
			//console.log("Entrou no Message read para mensagem : " + idMessage + " ".bgCyan.black.bold);
			objHistorico.SetMessageRead(idMessage, function () {
				//console.log("Mensagem " + idMessage + " atualizada como lida.".bgCyan.black.bold);
			});
		} catch (ex) {
			return new Error(ex);
		}
	});
	// ----------------------------------------------------------------------------------------------------
	// TRANSFERENCIA DE ARQUIVO
	// ----------------------------------------------------------------------------------------------------
	socket.on('Start', function (data) { //data contains the variables that we passed through in the html file
		//console.log("############ Start  Transf File ######################");
		var Name = data['Name'];

		Files[Name] = {
			FileSize: data['Size'],
			Data: "",
			Downloaded: 0
		}
		var Place = 0;
		var jsonData = { 'Place': Place, 'Percent': 0, 'from': data.sender, 'Name': data.Name };
		if (socket.state == socket.OPEN) {
			socket.emit('MoreData', jsonData);
		}
	});
	// UPLOAD
	socket.on('sendFile', function (data) {
		//console.log("############ Send File ######################");
		var Name = data['Name'];
		var fileMime = mime.lookup(Name);
		var sender = data.sender;
		var from = data.receiver;
		//
		Files[Name]['Downloaded'] += data['Data'].length;
		Files[Name]['Data'] += data['Data'];
		var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;

		socket.exchange.publish(data.receiver, { action: "getData", chunk: data['Data'], 'Name': Name, mimeType: fileMime, fileSize: Files[Name]['FileSize'], from: sender, 'Percent': Percent });
		//
		if (Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
		{
			socket.exchange.publish(data.receiver, { action: "endTransfer", 'Name': Name, mimeType: fileMime, from: sender, 'Percent': Percent });
			//console.log("Publish arquivo transferido enviado");
		} else {
			var Place = Files[Name]['Downloaded'] / 524288;
			var jsonData = { 'Place': Place, 'Percent': Percent, 'from': from, 'Name': Name };
			if (socket.state == socket.OPEN) {
				socket.emit('MoreData', jsonData);
			}
		}
	});
	// ----------------------------------------------------------------------------------------------------
	// Quando o usuário aceita a transferência do arquivo
	// ----------------------------------------------------------------------------------------------------
	socket.on('acceptFile', function (data) {
		objUser.FindUserById(parseInt(data.usrSender, 10), function (usr) {
			//console.log("Enviando o arquivo para o usuario: " + usr.Nome);
			if (usr) {
				data.action = 'startSendFile';
				data.username = usr.Nome;
				data.userid = data.usrSender;
				data.from = data.usrReceiver;
				data.fileName = "";
				socket.exchange.publish(data.usrSender, data);
			}
		});
	});
	// ----------------------------------------------------------------------------------------------------
	// Quando o usuário não aceita a transferência do arquivo
	// ----------------------------------------------------------------------------------------------------
	socket.on('cancelFile', function (data) {
		try {
			objUser.FindUserById(parseInt(data.userSender, 10), function (usr) {
				if (usr) {
					//socket.exchange.publish(data.userSender, { action: "cancelSendFile", usrReceiver: this.user.Id, fileName: data.filename });
					socket.exchange.publish(data.userSender, { action: "cancelSendFile", usrReceiver: usr.Id, fileName: data.filename });
				}
			});
		} catch (ex) {
			return new Error(ex);
		};
	});
	// ----------------------------------------------------------------------------------------------------
	// Quando finaliza a transferência do arquivo.
	// ----------------------------------------------------------------------------------------------------
	socket.on('fileTransferFinished', function (data) {
		try {
			objUser.FindUserById(parseInt(data.usrSender, 10), function (usr) {
				if (usr) {
					//console.dir(this.user);
					socket.exchange.publish(data.usrSender, { action: "fileTransferFinished", msg: 'Arquivo <span class="fileName fontItalic">' + data.fileName + '</span> enviado com sucesso!', remetente: data.from, nick: data.username, fileName: data.fileName });
					//delete this.user.fileTransfer[data.usrSender];
				}
			});
		} catch (ex) {
			return new Error(ex);
		};
	});
	// ----------------------------------------------------------------------------------------------------
	// Atualiza o percentual de transferência do arquivo no lado de quem está enviando.
	// ----------------------------------------------------------------------------------------------------
	socket.on('fileTransferPercent', function (data) {//usrSender, percCompleted
		try {
			objUser.FindUserById(parseInt(data.receiver, 10), function (usr) {
				if (usr) {
					if (data.percent > 100) {
						socket.exchange.publish(data.receiver, { action: "fileTransferPercent", sender: data.sender, receiver: socket.user.Id, percentual: data.percent, fileName: data.filename });
						//console.log("filetransferpercent enviado - " + data.percent);
					}
				}
			});
		} catch (ex) {
			return new Error(ex);
		};
	});
	// ----------------------------------------------------------------------------------------------------
	// Quando o remetente está digitando uma mensagem este evento avisa ao destinatário o acontecimento
	// ----------------------------------------------------------------------------------------------------
	socket.on('typing', function (data) {
		try {
			socket.exchange.publish(data.Id.toString(), { action: "typing", from: data.from });
		} catch (ex) {
			return new Error(ex);
		};
	});
	// ----------------------------------------------------------------------------------------------------
	// Quando o remetente para de digitar uma mensagem este evento avisa ao destinatário o acontecimento
	// ----------------------------------------------------------------------------------------------------
	socket.on('stopTyping', function (data) {
		try {
			socket.exchange.publish(data.Id, { action: "stopTyping", from: data.from });
		} catch (ex) {
			return new Error(ex);
		};
	});
	// ----------------------------------------------------------------------------------------------------
	// Quando começa uma conversa é registrado no array as partes da conversa, cada remetente recebe o ID 
	// do destinatário.
	// ----------------------------------------------------------------------------------------------------
	socket.on('startChatting', function (data) {
		try {
			objUser.FindUserById(parseInt(data.from, 10), function (usr) {
				if (usr) {
					usr.talkList.push(data.to);
				}
			});
		} catch (ex) {
			return new Error(ex);
		};
	});
	// ----------------------------------------------------------------------------------------------------
	// Quando termina (fecha a caixa de chat) uma conversa é removido do array o destinatário da conversa.
	// ----------------------------------------------------------------------------------------------------
	socket.on('endChatting', function (data) {
		try {
			objUser.RemoveTalkListener(data.from, data.to);
		} catch (ex) {
			return new Error(ex);
		};
	});
	// ----------------------------------------------------------------------------------------------------
	// Busca o historico de mensagens
	// ----------------------------------------------------------------------------------------------------
	socket.on('getHistoric', function (data) {
		var _De = data.De;
		var socketId = data.SocketId;
		if (data.Offset < 1) {
			//console.log('#### Retornando Historico ####');
			objHistorico.GetLastMessages(data, function (_data) {
				try {
					var _obj = [];

					for (item in _data) {
						delete _data[item].dataValues['Evento'];
						_obj.push(_data[item].dataValues);
					}
					socket.exchange.publish(_De, { action: "getHistoric", hist: _obj, SocketId: socketId });
					//socket.exchange.publish(data.usrSender, data);
				} catch (ex) {
					//console.log('Err');
					//console.dir(ex);
					return new Error(ex);
				}
			});
		} else {
			//console.log('#### Retornando Historico ####');
			objHistorico.GetMessagesOffset(data, function (_data) {
				try {
					var _obj = [];

					for (item in _data) {
						delete _data[item].dataValues['Evento'];
						_obj.push(_data[item].dataValues);
					}
					socket.exchange.publish(_De, { action: "getHistoric", hist: _obj, SocketId: socketId });
				} catch (ex) {
					//console.log('Err');
					//console.dir(ex);
					return new Error(ex);
				}
			});
		}
	});
	// ----------------------------------------------------------------------------------------------------
	// Muda o status virtual do usuário para os outros usuários (online, ocupado, ausente, invisivel)
	// ----------------------------------------------------------------------------------------------------		
	socket.on('changeUserStatus', function (data) {
		var uStatus = data.status.toLowerCase();
		switch (uStatus) {
			case 'online':
				uStatus = 0;
				break;
			case 'busy':
				uStatus = 1;
				break;
			case 'away':
				uStatus = 2;
				break;
			case 'invisible':
				uStatus = 3;
				break;
			default:
				uStatus = 0;
				break;
		}
		console.log('-----------------------------------------------------------');
		console.log("---> Status virtual : " + uStatus + " ".bgGreen.white.bold);
		console.log('-----------------------------------------------------------');
		objUser.UpdateUserStatus({ UserStatus: uStatus, Id: socket.userId }, function (result) {
			console.log("---> UpdateUserStatus   OK  ".bgGreen.white.bold);
			objUser.FindUserById(socket.userId, function (result) {
				console.log("---> FindUserById   OK  ".bgGreen.white.bold);
				var user = result;
				objCore.UpdateContactList(user, socket, false, function (result) {
					console.log("---> Status virtual enviado".bgGreen.white.bold);
				})
			});
		});
	});
	// ----------------------------------------------------------------------------------------------------
	// Busca informações deste servidor
	// ----------------------------------------------------------------------------------------------------		
	socket.on('getServerInfo', function () {
		try {
			//console.log("1 - Authentication".bgYellow.black.bold);
			objCpu.GetCPUInfo(function (result) {
				socket.emit("letServerInfo", result);
			});
		} catch (ex) {
			return new Error(ex);
		}
	});
	// ----------------------------------------------------------------------------------------------------
	// Erro 
	// ----------------------------------------------------------------------------------------------------	
	socket.on('error', function (data) {
		//console.log(" ----------------- socket error ----------------- ".bold.red)
		//console.log("2 - Disconectou".bgRed.white.bold);
		var userId = socket.userId;
		if (userId) {
			objUser.FindUserById(parseInt(userId, 10), function (user) {
				var jsonSocket = { UsuarioId: user.Id, SocketId: socket.id };
				objUser.FindUserSocket(jsonSocket, function (result) {
					if (result.count > 1) {
						socket.kickOut();
						objUser.RemoveUserSocket(jsonSocket, function (result) {
							//console.log("removeu o socket " + socket.id);
						});
					} else {
						//-----------------------------------------------------------------
						user.Status = 'Offline';
						objCore.UpdateContactList(user, socket, false, function (result) {
							socket.kickOut();
						});
						//-----------------------------------------------------------------
						objUser.UpdateStatus({ Id: user.Id, Status: 'Offline' }, function (result, metadata) {
							objUser.RemoveUserSocket({ UsuarioId: user.Id }, function (result) { });
						});
					}
				});
			}, function (Id) { console.log('User com Id: ' + Id + ' não encontrado.'); });
		}
		global.gc();
		//console.log(" ----------------- socket error ----------------- ".bold.red)
	});
	// ----------------------------------------------------------------------------------------------------
	// Erro 
	// ----------------------------------------------------------------------------------------------------		
	socket.on('notice', function (data) {
		//console.log("----------------------------------------------- socket notice ----------------------------------------------- ")
		console.error(data);
		//console.log("----------------------------------------------- socket notice ----------------------------------------------- ")
	});
	// ----------------------------------------------------------------------------------------------------
	// Reinicia este servidor
	// ----------------------------------------------------------------------------------------------------	
	socket.on('restartServer', function (data) {
		objUser.FindUserByServerAddress(ip.address(), function (data) {
			console.log('Removendo Sockets');
			if (data.length > 0) {
				objUser.RemoveUserSocketByServerAddress(data, ip.address(), function (data) {
					//console.dir(data);
					objUser.GetUsersToSetOffline(data, function (data) {
						var _data = data
						objUser.UpdateStatusById(_data, function (data) {
							for (var i in data) {
								objUser.FindUserById(data[i], function (_data) {
									//console.log('Update contact List #######################');
									//objCore.UpdateContactList(_data, socketCluster, false);
									socketCluster.sendToWorker(0, { action: 'UpdateList', user: _data });
								});
							}
							var restart = new run_cmd(
								'sudo', ['systemctl', 'restart', 'wachat'],
								function (me, buffer) { me.stdout += buffer.toString() },
								function () { console.log(foo.stdout) }
							);
						});
					});
				});
			} else {
				var restart = new run_cmd(
					'sudo', ['systemctl', 'restart', 'wachat'],
					function (me, buffer) { me.stdout += buffer.toString() },
					function () { console.log(foo.stdout) }
				);
			}
		});
	});
	// ----------------------------------------------------------------------------------------------------
	// Envia uma imagem com o qrCode do socket.id
	// ----------------------------------------------------------------------------------------------------
	socket.on('GetQRImage', function () {
		try {
			genQrImage(socket.id, function (result) {
				socket.emit("qrImage", { imgBase64: result });
			});
		} catch (ex) {
			return new Error(ex);
		}
	});
	// ----------------------------------------------------------------------------------------------------
	// Envia uma imagem com o qrCode do Hash de login do usuario
	// ----------------------------------------------------------------------------------------------------
	socket.on('GetQRImageSite', function (data) {
		try {
			console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
			console.dir(data);
			console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
			var strJson = data;
			genQrImage(strJson, function (result) {
				console.log('-------------------');
				console.log(result);
				console.log('-------------------');
				socket.emit("qrImageSite", { imgBase64: result });
			});
		} catch (ex) {
			return new Error(ex);
		}
	});

	// ----------------------------------------------------------------------------------------------------
	// Recebe o pedido do login do app com o socket.id do usuario no site
	// ----------------------------------------------------------------------------------------------------
	socket.on('LoginQrCode', function (data) {
		try {
			debugger;
			socket.emit("qrLoginConfirm", { login: "OK" });
			socket.exchange.publish("qrLoginConfirm", { login: "OK" });
			console.log('------------------------ SOCKET ID ----------------------------------------');
			console.dir(socket.id);
			console.log('------------------------ SOCKET ID ----------------------------------------');
			data = JSON.parse(data);
			socket.exchange.publish(data.socketId.toString(), { action: "doQrLogin", userHash: data.hash });
			console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
			//console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
		} catch (ex) {
			return new Error(ex);
		}
	});
	// ----------------------------------------------------------------------------------------------------
	// Recebe o nome e codExterno do aluno e suas salas, se não existir o user cria
	// Se a(s) sala(s) não existir as cria
	// Faz a associação do usuario com as suas salas (Salas_Usuarios).
	// ----------------------------------------------------------------------------------------------------
	socket.on('GetOrCreateUser', function (objUser) {
		try {
			var userCreated = {};
			objUser.findOrInitialize(objUser, function (result) {
				userCreated = result;
				objRoom.InsertRoomUser(sala, result, function (result) {
					if (result) {
						socket.emit("usrCreateConfirm", { Created: "OK", User: userCreated });
					} else {
						socket.emit("usrCreateConfirm", { Created: "Error", User: userCreated });
					}
				});
			});
		} catch (e) {
			throw (new Error(e.message));
		}
	});
	// ----------------------------------------------------------------------------------------------------
	// Gera a imagem do QRCode
	// ----------------------------------------------------------------------------------------------------		
	function genQrImage(socketId, callback) {
		console.log(socketId);
		var qr_svg = qr.imageSync(socketId, { type: 'png' });
		var qr_str = '<img src="data:image/png;base64,' + qr_svg.toString('base64') + '" />';
		console.log(qr_str);
		callback(qr_str);
	}
	// ----------------------------------------------------------------------------------------------------
	// Reinicia o servidor
	// ----------------------------------------------------------------------------------------------------		
	function run_cmd(cmd, args, cb, end) {
		var spawn = require('child_process').spawn,
			child = spawn(cmd, args),
			me = this;
		child.stdout.on('data', function (buffer) { cb(me, buffer) });
		child.stdout.on('end', end);
	}
};

