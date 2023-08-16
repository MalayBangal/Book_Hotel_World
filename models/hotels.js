const mongoose = require('mongoose');
const hotelsSchema = new mongoose.Schema({
    name: {
		type: String,
		required: true
	},
	price: String,
	address: String,
	description: String,
	image: [ String ],
	createdAt: {
		type: Date,
		default: Date.now()
	},
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'review'
		}
	],
	location: {
		type: {
			type: String
		},
		coordinates: [ Number ]
	},
	sumOfRatings: {
		type: Number,
		default: 0
	},
	averageRating: {
		type: Number,
		default: 0
	},
	totalRatings: {
		type: Number,
		default: 0
	},
	author:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'user'
	}
});

module.exports = mongoose.model("hotel",hotelsSchema)