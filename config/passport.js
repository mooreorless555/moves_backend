var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require('../app/models/user');
var config = require('../config/auth');

module.exports = function(passport) {
	
	var opts = {};
	opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
	opts.secretOrKey = config.secret;

	passport.use(new JwtStrategy( opts, function(jwt_payload, done) {

		User.findOne({id: jwt_payload.id}, function(err, user) {

			if (err) {
				return done(err, false);
			}

			if (user) {
				done(null, user);
			} else {
				done(null, false);
			}

		});
	}));

	/*
	passport.use('jwt-login', new JwtStrategy({

		jwtFromRequest: ExtractJwt.fromAuthHeader(),
		secretOrKey: config.secret
	
	}, function (jwt_payload, done) {
		
		User.findOne({id: jwt_payload.id}, function(err, user) {
			
			if (err) {
				return done(err, false);
			}

			if (user) {
				done(null, user);
			} else {
				done(null, false);
			}
		});
	}));
	*/

};