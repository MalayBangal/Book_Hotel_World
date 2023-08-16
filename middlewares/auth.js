const Review = require('../models/review');
const Hotel = require('../models/hotels');

module.exports.isLoggedIn = (req,res,next) =>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error','You must be logged in to do that');
    res.redirect('/login');
}

module.exports.checkReviewUser =async (req,res,next) =>{
    try {
        const review = await Review.findById(req.params.reviewId);
        if(review.user.equals(req.user._id)) return next();
        req.flash('error','You cannot do that');
        res.redirect('back');
    } catch (error) {
        req.flash('error','Somthing went wrong');
        console.log(error);
        res.redirect('back');
    }
}
module.exports.checkHotelUser =async (req,res,next) =>{
    try {
        const hotel = await Hotel.findById(req.params.id);
        if(hotel.author.equals(req.user._id)) return next();
        req.flash('error','You cannot do that');
        res.redirect('back');
    } catch (error) {
        req.flash('error','Somthing went wrong');
        console.log(error);
        res.redirect('back');
    }
}