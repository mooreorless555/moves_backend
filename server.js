var express 			= require('express');
var bodyParser 			= require('body-parser');
var passport 			= require('passport');
var mongoose 			= require('mongoose');
var morgan 				= require('morgan');
//var FacebookStrategy 	= require('passport-facebook').Strategy;

var app = express();

var jwt		= require('jwt-simple');
var config 	= require('./config/auth');


// Models
var Move = require('./app/models/move.js');
var User = require('./app/models/user.js');

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// morgan logs requests to the console
app.use(morgan('dev'));

/*
app.use(passport.initialize());
app.use(passport.session());
*/

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

require('./config/passport')(passport);

/*
app.post('/api/signup', passport.authenticate('jwt-signup', {
	successRedirect : '/api/profile',
	failureRedirect : '/api/signup'
}))
*/

app.post('/api/signup', function(req, res) {
	if(!req.body.email || !req.body.name || !req.body.password) {
		res.json({success: false, msg: 'Please pass email, name and password.'});
	} else {
		var newUser = new User({
			email: req.body.email,
			name: req.body.name,
			password: req.body.password
		});

		// save new user
		newUser.save(function(err) {
			if(err) {
				return res.json({success: false, msg: 'Email already exists'});
			}
			res.json({success: true, msg: 'Successful created new user.'});
		});
	}
});


app.post('/api/authenticate', function(req, res) {
	User.findOne({
		email: req.body.email
	}, function(err, user) {
		if (err) throw err;

		if (!user) {
			res.send({success: false, msg: 'Authentication failed. User not found.'});
		} else {
			user.comparePassword(req.body.password, function(err, isMatch) {
				if (isMatch && !err) {
					var token = jwt.encode(user, config.secret);

					res.json({success: true, token: 'JWT ' + token});
				} else {
					res.send({success: false, msg: 'Authentication failed. Wrong password.'});
				}
			});
		}
	});
});


app.post('/api/FBauthenticate', function(req, res) {
	
	console.log(req.body);

	User.findOne({
		email: req.body.email
	}, function(err, user) {
		if (err) console.log(err);

		// If no user exists, create one
		if (!user) {
			var newUser = new User({
				email: req.body.email,
				name: req.body.name,
				password: req.body.social_token,
				social_token: req.body.social_token
			});

			// save new user
			newUser.save(function(err) {
				if(err) {
					console.log("Couldn't save user: " + err + "User: " + newUser);
					return res.json({success: false, msg: 'Username already exists'});
				}
				console.log("New user: " + newUser);
				
				var token = jwt.encode(newUser, config.secret);
				res.json({success: true, msg: 'Successful created new user.', token: 'JWT ' + token});
			});

		} else {
			if (req.body.refresh_token) {
				user.facebook.social_token = req.body.refresh_token;
			}
			console.log("found existing user: " + user);
			var token = jwt.encode(user, config.secret);
			res.json({success: true, token: 'JWT ' + token});
		}
	});
});

app.get('/api/profile', isLoggedIn, function(req, res) {
	res.json(req.user);
});


function isLoggedIn(req, res, next) {
	var token = getToken(req.headers);
	console.log(req.headers);
	console.log(token);

	if (token) {
		var decoded = jwt.decode(token, config.secret);
		console.log(decoded);
		User.findOne({
			username: decoded.username
		}, function(err, user) {
			if (err) throw err;

			if (!user) {
				res.json({success: false, msg: 'No user found'});
			} else {
				req.user = user;
				return next();
			}
		});
	} else {
		res.json({success: false, msg: 'Please pass a token'});
	}
}

getToken = function(headers) {
	if (headers && headers.authorization) {
		var parted = headers.authorization.split(' ');
		
		if (parted.length === 2) {
			return parted[1];
		} else {
			return null;
		}
	} else {
		return null;
	}
};

/*
passport.use(new FacebookStrategy({
  clientID: config.facebookAuth.clientID,
  clientSecret: config.facebookAuth.clientSecret,
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    done(null, profile);
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/success',
  failureRedirect: '/error'
}));

app.get('/success', function(req, res, next) {
  res.send('Successfully logged in.');
});

app.get('/error', function(req, res, next) {
  res.send("Error logging in.");
});
*/
// Handlers
app.route('/')
	// GET all moves
	.get(isLoggedIn, (req, res) => {
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
		console.log(req.params.id);
		console.log(mongoose.Types.ObjectId.isValid(req.params.id));
		Move.findById(new mongoose.Types.ObjectId(req.params.id), (err, move) => {
			if (err) return res.send(500, err)
			
			res.json(move)
		})
	})
	// UPDATE move
	.put((req, res) => {
		Move.findOneAndUpdate({id: req.params.id}, req.body, (err, result) => {
			if (err) return res.send(err)
			res.send(result);
		})
	})
	// DELETE move
	.delete((req, res) => {
		Move.findByIdAndRemove(req.params.id, (err) => {
			if (err) return res.send(500, err);
			console.log('Move deleted');
		})
	})

