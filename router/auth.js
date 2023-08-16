const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

router.get('/login',(req,res) =>{
    res.render('user/login',{page:'Login'});
});
router.post('/login',passport.authenticate('local',{
    failureFlash: true,
    failureRedirect: '/login',
    
}),(req,res)=>{
    res.redirect('/hotels');
})
router.get('/signup',(req,res)=>{
    res.render('user/signup',{page:'Signup'});
});
router.post('/signup', async (req,res)=>{
    try {
        const newUser = new User(req.body.user);
        let registeredUser = await User.register(newUser,req.body.password);
        req.login(registeredUser,(error)=>{
           if(error) return res.send(error);
           res.redirect('/hotels');
        })
    } catch (error) {
        res.send(error);
    }
});
router.get('/logout',(req,res) =>{
    req.logout((error)=>{
        if(error) return res.send(error);
        res.redirect('/hotels');
    })
});

module.exports = router;