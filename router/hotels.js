const express = require('express');
const router = express.Router();
//payment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
//clouddinary
const multer  = require('multer');
const storage = require('../cloudinary/index');
const upload = multer({storage});

//mapbox
const geocoding  = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = geocoding({ accessToken: process.env.MAPBOX_TOKEN });

//nodemailer

const { sendEmail } = require('../middlewares/email');

const {isLoggedIn,checkHotelUser} = require('../middlewares/auth')

const Hotel = require('../models/hotels');

router.get('/', (req, res) => {
	res.render('landing', { page: 'Home - StaySense' });
});

//*contact

router.get('/contact', (req, res) => {
	res.render('contact/contact', { page: 'Contact' });
});

router.post('/contact', async (req, res) => {
	try {
		await sendEmail(req.body.contact);
		req.flash('success','Email successfully send');
		res.redirect('/contact');
	} catch (error) {
		console.log(error);
		req.flash('error','Somthing went wrong when try to send email');
		res.redirect('/hotels');
	}
});

//*hotels

router.get('/hotels', async (req, res) => {
	try {
		console.log(req?.user?.name);
		const hotels = await Hotel.find();
		res.render('hotels/index', { hotels, page: 'All Hotels - StaySense' });
	} catch (error) {
		console.log(error);
		req.flash('error','Somthing went wrong while fatching the hotels');
		res.redirect('/');
	}
});
router.get('/hotels/new',isLoggedIn, (req, res) => {
	res.render('hotels/new', { page: 'New Hotel - StaySense' });
});
router.post('/hotels',  upload.array('image') ,isLoggedIn, async (req, res) => {
	try {
		const newHotel = new Hotel(req.body.hotel);
		newHotel.author = req.user._id;
		for(let img of req.files){
			newHotel.image.push(img.path);
		}
		//mapbox setup
		const query = req.body.hotel.address;
		const result = await geocodingClient
			.forwardGeocode({
				query,
				limit: 1
			})
			.send();
		newHotel.location = result.body.features[0].geometry;
		await newHotel.save();
		req.flash('success','Hotel successfully saved');
		res.redirect(`/hotels/${newHotel._id}`);
	} catch (error) {
		console.log(error);
		req.flash('error','Somthing went wrong when try to save the hotel');
		res.redirect('/hotels');
	}
});
router.get('/hotels/:id', async (req, res) => {
	try {
		const { id } = req.params;
		let likeExists=null, dislikeExists=null;
		if(req.user){
			likeExists = await Hotel.findOne({
				_id: id,
				upvotes: req.user._id
			});
			dislikeExists = await Hotel.findOne({
				_id: id,
				downvotes: req.user._id
			});
		}
		const hotel = await Hotel.findById(req.params.id).populate('reviews');
		const reviews = hotel.reviews;
		res.render('hotels/show', { likeExists,dislikeExists,reviews, hotel, page: 'Hotel Details - StaySense' });
	} catch (error) {
		console.log(error);
		req.flash('error','Somthing went wrong while showing the hotel');
		res.redirect('/hotels');
	}
});
router.get('/hotels/:id/edit',isLoggedIn,checkHotelUser, async (req, res) => {
	try {
		const hotel = await Hotel.findById(req.params.id);
		res.render('hotels/edit', { hotel, page: 'Edit Hotel - StaySense' });
	} catch (error) {
		console.log(error);
		req.flash('error','Somthing went wrong when try to edit the hotel');
		res.redirect('/hotels');
	}
});
router.patch('/hotels/:id',upload.array('image') ,isLoggedIn ,checkHotelUser, async (req, res) => {
	try {
		const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body.hotel);
		const query = req.body.hotel.address;
		const result = await geocodingClient
			.forwardGeocode({
				query,
				limit: 1
			})
			.send();
		hotel.location = result.body.features[0].geometry;
		await hotel.save();
		req.flash('success','Hotel successfully updeted');
		res.redirect(`/hotels/${req.params.id}`);
	} catch (error) {
		console.log(error);
		req.flash('error','Somthing went wrong when try to updete the hotel');
		res.redirect('/hotels');
	}
});
router.delete('/hotels/:id',isLoggedIn,checkHotelUser, async (req, res) => {
	try {
		await Hotel.findByIdAndRemove(req.params.id);
		req.flash('success','Hotel deleted successfully');
		res.redirect('/hotels');
	} catch (error) {
		console.log(error);
		req.flash('error','Somthing went wrong when try to delete the hotel');
		res.redirect('/hotels');
	}
});

router.get('/hotels/:id/checkout',isLoggedIn, async (req, res) => {
	try {
		const hotel = await Hotel.findById(req.params.id);
		const session = await stripe.checkout.sessions.create({
			payment_method_types: [ 'card' ],
			line_items: [
				{
					price_data: {
						currency: 'inr',
						product_data: {
							name: hotel.name,
							description: hotel.address,
							images: [ hotel.image[0] ]
						},
						unit_amount: hotel.price * 100
					},
					quantity: 1
				}
			],
			mode: 'payment',
			success_url: 'http://localhost:3000/success',
			cancel_url: 'http://localhost:3000/cancel'
		});
		res.redirect(session.url);
	} catch (error) {
		res.send(error);
	}
});
router.get('/success', (req, res) => {
	res.send('payment successful');
});
router.get('/cancel', (req, res) => {
	res.send('payment cancelled');
});

router.get('/hotels/:id/upvote', isLoggedIn, async (req, res) => {
	try {
		const { id } = req.params;
		const likeExists = await Hotel.findOne({
			_id: id,
			upvotes: req.user._id
		});
		const dislikeExists = await Hotel.findOne({
			_id: id,
			downvotes: req.user._id
		});
		// check if user has already liked -> remove that like
		// check if user has already disliked -> change from dislike to like
		// else -> add a new like
		if (likeExists) {
			await Hotel.findByIdAndUpdate(id, {
				$pull: { upvotes: req.user._id }
			});
			req.flash('success', 'removed your like');
			res.redirect(`/hotels/${id}`);
		} else if (dislikeExists) {
			await Hotel.findByIdAndUpdate(id, {
				$pull: { downvotes: req.user._id },
				$push: { upvotes: req.user._id }
			});
			req.flash('success', 'changed dislike to like');
			res.redirect(`/hotels/${id}`);
		} else {
			const hotel = await Hotel.findById(id);
			hotel.upvotes.push(req.user);
			await hotel.save();
			req.flash('success', 'added a like');
			res.redirect(`/hotels/${id}`);
		}
	} catch (error) {
		res.send(error);
	}
});
router.get('/hotels/:id/downvote', isLoggedIn, async (req, res) => {
	try {
		const { id } = req.params;
		const likeExists = await Hotel.findOne({
			_id: id,
			upvotes: req.user._id
		});
		const dislikeExists = await Hotel.findOne({
			_id: id,
			downvotes: req.user._id
		});
		// check if user has already disliked -> remove that dislike
		// check if user has already liked -> change from like to dislike
		// else -> add a new dislike
		if (dislikeExists) {
			await Hotel.findByIdAndUpdate(id, {
				$pull: { downvotes: req.user._id }
			});
			req.flash('success', 'removed your dislike');
			res.redirect(`/hotels/${id}`);
		} else if (likeExists) {
			await Hotel.findByIdAndUpdate(id, {
				$pull: { upvotes: req.user._id },
				$push: { downvotes: req.user._id }
			});
			req.flash('success', 'changed from like to dislike');
			res.redirect(`/hotels/${id}`);
		} else {
			const hotel = await Hotel.findById(id);
			hotel.downvotes.push(req.user);
			await hotel.save();
			req.flash('success', 'added a dislike');
			res.redirect(`/hotels/${id}`);
		}
	} catch (error) {
		res.send(error);
	}
});

module.exports = router;