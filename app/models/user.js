var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
//var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	admin: {
		type: Boolean,
		default: false
	},
	facebook_token: {
		type: String,
		unique: true,
		require: false
	}
});

UserSchema.pre('save', function (next) {
	var user = this;

	if(this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			}
			bcrypt.hash(user.password, salt, function (err, hash) {
				if (err) {
					return next(err);
				}
				user.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});

UserSchema.methods.comparePassword = function(password, cb) {
	bcrypt.compare(password, this.password, function (err, isMatch) {
		if(err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};

//User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);