const mongoose = require('mongoose');

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
		people: Number
	},
	updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Move', MoveSchema);