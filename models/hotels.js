const mongoose = require('mongoose');
const hotelsSchema = new mongoose.Schema({
    name: {
		type: String,
		required: true
	},
	price: {
				type: Number,
				required: true,
				min: [ 100, 'hotel room needs to be atleast 100 rs' ],
				max: 100000
			},
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
	},
	upvotes: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'user'
				}
			],
	downvotes: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'user'
				}
			]
});

module.exports = mongoose.model("hotel",hotelsSchema);

// const mongoosePaginate = require('mongoose-paginate-v2');
// const hotelSchema = new mongoose.Schema({
// 	name: {
// 		type: String,
// 		required: true
// 	},
// 	address: {
// 		type: String,
// 		required: true
// 	},
// 	price: {
// 		type: Number,
// 		required: true,
// 		min: [ 100, 'hotel room needs to be atleast 100 rs' ],
// 		max: 100000
// 	},
// 	isRoomAvailable: {
// 		type: Boolean,
// 		default: true
// 	},
// 	createdAt: {
// 		type: Date,
// 		default: Date.now()
// 	},
// 	author: {
// 		type: mongoose.Schema.Types.ObjectId,
// 		ref: 'user'
// 	},
// 	images: [
// 		{
// 			url: String,
// 			filename: String
// 		}
// 	],
// 	overAllRating: {
// 		type: Number,
// 		default: 0
// 	},
// 	reviews: [
// 		{
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: 'review'
// 		}
// 	],
// 	geometry: {
// 		type: {
// 			type: String,
// 			enum: [ 'Point' ],
// 			required: true
// 		},
// 		coordinates: {
// 			type: [ Number ],
// 			required: true
// 		}
// 	},
// 	upvotes: [
// 		{
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: 'user'
// 		}
// 	],
// 	downvotes: [
// 		{
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: 'user'
// 		}
// 	]
// });
// hotelSchema.method('crop', (img, width, height) => {
// 	const idx = img.indexOf('upload/') + 6;
// 	const first = img.slice(0, idx + 1);
// 	const second = img.slice(idx + 1);
// 	const result = first + `c_scale,w_${width},h_${height}/` + second;
// 	return result;
// });
// hotelSchema.plugin(mongoosePaginate);
// const Hotel = mongoose.model('hotel', hotelSchema);
// module.exports = Hotel;