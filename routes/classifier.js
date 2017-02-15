'use strict'
const express = require('express');
const router = express.Router();
const classifierCtrl = require("../controller/classifierController");
const natural = require('natural');
const path = require('path');
// for Facebook verification
router.get('/', function (req, res) {
	res.status(200).send('No futuro exibirá a lista de classifiers.')
})

router.get('/updateClassifier', function (req, res) {
	let classifier = new natural.BayesClassifier();
	let title = "";
	let arrWords = [];
	classifierCtrl.GetClassifiersWithWords("", function(result){
		if(result && result.length > 0){
			result.forEach(function(value, index){
				title = value.dataValues.Title;
				arrWords = [];
				value.dataValues.Classifiers_Words.forEach(function(value, index){
					arrWords.push(value.Word.dataValues.Title);
				});
				classifier.addDocument(arrWords, title);
			});
		}
		classifier.train();
		classifier.save(path.join(__dirname + '/../classifier.json'), function(result){
			res.sendStatus(200)
		});
	});
});



module.exports = router;