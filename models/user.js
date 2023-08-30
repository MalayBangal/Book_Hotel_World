const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// const userSchema = new mongoose.Schema({
// 	username: String,
// 	name: String,
// 	age: Number,
// 	phone: String,
// 	address: String,
// 	googleId: String,
// 	googleToken: String
// });

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [ true, 'you need to pass a username' ],
		unique: true,
		trim: true
	},
	image: {
		type: String
	},
	name: {
		type: String,
		default: 'not given',
		trim: true
	},
	address: String,
	googleId: String,
	googleToken: String
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('user', userSchema);

// passportLocalMongoose = require('passport-local-mongoose');



// userSchema.plugin(passportLocalMongoose);
// const User = mongoose.model('user', userSchema);
// module.exports = User;