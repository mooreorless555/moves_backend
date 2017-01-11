var mongoose = require('mongoose');
var Schema = mongoose.Schema

var MoveSchema = new mongoose.Schema({
	info: {
		name:String,
		capacity: Number,
		hasAlcohol: Boolean,
		extraInfo: String
	},
	location: { 
		long: Number, 
		lat: Number 
	},
	stats: {
		people: Number,
		fun: Number,
		meh: Number,
		dead: Number
	},
	hosts: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Move", MoveSchema);