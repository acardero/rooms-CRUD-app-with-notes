const express = require('express');
const router = express.Router();

const passport = require('passport');

const bcrypt = require('bcryptjs');
const bcryptSalt = 10;

const User = require('../models/user-model');

router.get('/signup', (req,res,next) => {
  res.render('auth/signup');
})

// npm i connect-flash
// npm i express-sessions
// npm i bcryptjs

router.post('/signup', (req,res,next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFullName = req.body.fullName;

  if(userEmail =="" || userPassword =="" || userFullName ==""){
    req.flash('error', 'Please fill in all the required fields')
    res.render('auth/signup')
  }

  User.findOne({ email: userEmail})
  .then(foundUser => {
    if(foundUser !==null){
      req.flash('error', 'Sorry that email / user already exists')
      res.redirect('/login');

      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPassword = bcrypt.hashSync(userPassword, salt);

    User.create({
      email: userEmail,
      password: hashPassword,
      fullName: userFullName
    })
    .then(user => {
      // if all good, login user automatically
      req.logIn(user, (err) => {
        if(err){
          // req.flash.error = 'some message here'
          // shorthand
          req.flash('error', 'Auto login is not working, please login manually')
          res.redirect('/login');
          return;
        }
        res.redirect('/profile');
      })

      // ** test consol.log **
      // console.log('Redirecting to antoher page: ', user);
    })
  .catch( error => next(error)); // closing User.create();
  })
  .catch ( error => next(error)); // clsing User.findOne();
})


router.get('/login', (req,res,next) => {
  res.render('auth/login');
})


router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}));



// LOGOUT

router.post('/logout', (req,res,next) => {
  req.logOut(); // .logOut() comes from passport => takes care of destroying the session
    res.redirect('/login');
})


// *** SLACK LOGIN ***
router.get('/slack-login', passport.authenticate('slack'));


// callbackURL: 'slack/callback => from slack-strategy.js
router.get('/slack/callback', passport.authenticate('slack', {
  successRedirect: '/profile',
  successFlash: 'Slack login successfull!',
  failureRedirect: '/login',
  failureMessage: 'Slack login failed, please try and login manually'
}));

// *** GOOGLE LOGIN ***

router.get("/google-login", passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/plus.profile.emails.read"]
}));

router.get("/google/callback", passport.authenticate("google", {
  successRedirect: "/profile",
  successMessage: 'Google login successful',
  failureRedirect: "/login",
  failureMessage: 'Google login failed, please try to login manually'
}));

module.exports = router;