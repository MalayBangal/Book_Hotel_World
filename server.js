const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const flash = require('connect-flash');
const app = express();

mongoose.connect(process.env.DB_URI).then(()=>{
    console.log("db Connected");
})
.catch((error)=>{
    console.log(error);
});

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly:true,
        // secure: true,
        maxAge:1000*60*60*24
     }
  }));


  // ! google auth setup
const { passportInit } = require('./config/passport');
passportInit(app);

// const User = require('./models/user');
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


app.use(flash());

app.use((req,res,next)=>{
    res.locals.moment = moment;
    res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.currentUser = req.user;
	next();
});

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const userRoutes = require('./router/auth');
const hotelRoutes = require('./router/hotels');
const reviewRoutes = require('./router/reviews');
const oAuthRoutes = require('./router/oAuth');
app.use(hotelRoutes);
app.use(reviewRoutes);
app.use(userRoutes);
app.use(oAuthRoutes);


app.get('/',(req,res) =>{
    res.render('landing', { page: 'Home - StaySense'});
});
app.get('*',(req,res) =>{
    res.send("404 nOT Found");
});
const port = process.env.PORT;
app.listen(port,() =>{
    console.log("Server Started at 3000");
});