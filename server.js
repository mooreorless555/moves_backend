const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

//Config
var config = require('./config.json');

// Models
var Move = require('./models/move.js');

// Middleware
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Handles any CORS errors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

// Database + Server
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect('mongodb://' + config.db.username + ':' + config.db.password + '@ds111178.mlab.com:11178/movesapp', (err) => {
	if (err) return console.log(err);
	console.log('[+] Connection Successful')

	app.listen(3000, () => {
		console.log('[+] Listening on port 3000')
	})
})
/*
const MongoClient = require('mongodb').MongoClient
var db

MongoClient.connect('mongodb://<username>:<password>@ds159497.mlab.com:59497/movespractice', (err, database) => {
	if (err) return console.log(err)
	db = database
	app.listen(3000, () => {
		console.log('listening on 3000')
	})
})
*/

// Handlers
app.route('/')
	// GET all moves
	.get((req, res) => {
		Move.find((err, moves) => {
			if (err) return console.log(err);
			console.log('[+] Moves fetched');
			console.log(moves);
			res.json(moves);
		})
		//res.sendFile(__dirname + '/index.html');
	})
	
	.post((req, res) => {
		//console.log(req)
		console.log(req.body)
		console.log(req.body.name)
		Move.create(req.body, (err, post) => {
			if (err) return console.log(err);
			console.log('[+] Move created');
			console.log(post);
			res.json(post);
			//res.redirect('/');
		})
	})

	.delete((req, res) => {
		db.collection('moves').findOneAndDelete({name: req.body.name}, (err, result) => {
			if (err) return res.send(500, err)
			res.send('Move deleted')
		})
	})

app.route('/moves/:id')
	// GET singular move
	.get((req, res) => {
		var cursor = db.collection('moves').findOne({id: req.params.id}, (err, result) => {
			if (err) return res.send(500, err)
			res.send(results)
		})
	})
	// DELETE move
	.delete((req, res) => {
		Move.findByIdAndRemove(req.params.id, (err) => {
			if (err) return res.send(500, err);
			console.log('Move deleted');
		})
	})
