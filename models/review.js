const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
	title: String,
	body: {
				type: String,
				required: true,
				trim: true
			},
	user: {
		type:mongoose.Schema.Types.ObjectId,
		tef:'user'
	},
	stars: {
		type: Number,
		max: 5,
		min: 1
	}
});

module.exports = mongoose.model('review', reviewSchema);

// const reviewSchema = new mongoose.Schema({
// 	rating: {
// 		type: Number,
// 		required: true,
// 		min: 1,
// 		max: 5
// 	},
// 	author: {
// 		type: mongoose.Schema.Types.ObjectId,
// 		ref: 'user'
// 	},
// 	body: {
// 		type: String,
// 		required: true,
// 		trim: true
// 	}
// });

// const Review = mongoose.model('review', reviewSchema);
// module.exports = Review;