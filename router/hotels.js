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
		const hotel = await Hotel.findById(req.params.id).populate('reviews');
		const reviews = hotel.reviews;
		res.render('hotels/show', { reviews, hotel, page: 'Hotel Details - StaySense' });
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

module.exports = router;