//==============================================================================================================================
var Sequelize = require('sequelize');
//==============================================================================================================================
//var sequelize = new Sequelize('waChat', 'usrChat', 'w@Usr01', {
//	host: 'wadb1604.webaula.dc',
//	port: 51616,
//	dialect: 'mssql',
//	pool: {
//		max: 64,
//		min: 0,
//		idle: 5000
//	},
//	logging: false,
//	timezone: '-03:00'
//});
var sequelize = new Sequelize('wachat', 'usrChat', 'w@Usr01', {
	host: 'wabhzpc093',
	dialect: 'mssql',
	pool: {
		max: 64,
		min: 0,
		idle: 5000
	},
	logging: console.log,
	timezone: '-02:00'
});
//==============================================================================================================================
// - Chat Models
sequelize.import("../models/maps/Company.js");
sequelize.import("../models/maps/Event.js");
sequelize.import("../models/maps/Room.js");
sequelize.import("../models/maps/User.js");
sequelize.import("../models/maps/Room_User.js");
sequelize.import("../models/maps/User_Socket.js");
sequelize.import("../models/maps/Historic.js");
sequelize.import("../models/maps/UserStatus.js");
// - Bot Models
sequelize.import("../models/maps/Classifier.js");
sequelize.import("../models/maps/Word.js");
sequelize.import("../models/maps/Classifier_Word.js");
sequelize.import("../models/maps/Answer.js");
sequelize.import("../models/maps/Question.js");
sequelize.import("../models/maps/Question_Word.js");
//==============================================================================================================================
// - Chat 
var Companies = sequelize.models.Company;
var Events = sequelize.models.Event;
var Rooms = sequelize.models.Room;
var Users = sequelize.models.User;
var UserStatus = sequelize.models.UserStatus;
var Room_Users = sequelize.models.Room_User;
var Users_Sockets = sequelize.models.User_Socket;
var Historical = sequelize.models.Historic;
// - Bot 
var Classifiers			= sequelize.models.Classifier;
var Words				= sequelize.models.Word;
var Classifier_Word		= sequelize.models.Classifier_Word;
var Answers				= sequelize.models.Answer;
var Questions			= sequelize.models.Question;
var Question_World		= sequelize.models.Question_World;
////==============================================================================================================================
// - Chat Relations

Users.belongsTo(Companies, { onDelete: 'NO ACTION' });
Users.belongsTo(UserStatus, { onDelete: 'NO ACTION' });
Users.hasMany(Room_Users, { onDelete: 'cascade' });
//
Rooms.belongsTo(Companies, { onDelete: 'NO ACTION' });
Rooms.hasMany(Room_Users, { onDelete: 'cascade' });
//
Room_Users.belongsTo(Rooms, { onDelete: 'NO ACTION' });
Room_Users.belongsTo(Users, { onDelete: 'NO ACTION' });
//
Events.hasMany(Historical, { onDelete: "NO ACTION" });
//
Historical.belongsTo(Events, { onDelete: "NO ACTION" });
//
UserStatus.hasMany(Users, { onDelete: 'NO ACTION' });

// - Bot Relations
Classifiers.hasMany(Classifier_Word, { onDelete: 'cascade' });
Classifier_Word.belongsTo(Classifiers, { onDelete: 'NO ACTION' });
Classifier_Word.belongsTo(Words, { onDelete: 'NO ACTION' });
Classifiers.hasMany(Questions, { onDelete: 'cascade' });
//
Questions.hasMany(Answers, { onDelete: 'cascade' });
Questions.hasMany(Question_World, { onDelete: 'cascade' });
Questions.belongsTo(Classifiers, { onDelete: 'NO ACTION' });
//
Words.hasMany(Answers, { onDelete: 'cascade' });
Words.hasMany(Classifier_Word, { onDelete: 'cascade' });
Words.hasMany(Question_World, { onDelete: 'cascade' });
//==============================================================================================================================
// Atualiza o modelo deletando tudo e depois criando tudo novamente
//sequelize.sync();
//sequelize.sync({ force: true });
//==============================================================================================================================
module.exports = sequelize;