// require passport
const passport = require('passport');
const User = require('../../models/user-model.js');
const flash = require('connect-flash');

// require local-stratgey & slack strategy
require('./local-strategy');
require('./slack-strategy');
require('./google-strategy');

// serializeUser => what is saved in a session
// cb stands for callback => other documentation says done
passport.serializeUser((user, cb) => {
  // null => no errors
  cb(null, user._id); // save user id into session
});

// deserializeUser => retreive user's data from DB
// this function gets called every time we request a user
passport.deserializeUser((userId, cb) => {
  User.findById(userId)
  .then(user => {
    cb(null, user);
  })
  .catch(error => cb(err));
});

function passportBasicSetup(app){
  app.use(passport.initialize()); // => 'fires' the passport package
  app.use(passport.session()); // => connects passport to session


  app.use(flash());

  app.use((req,res,next) => {
  res.locals.messages = req.flash();

  if(req.user){
    res.locals.currentUser = req.user; // make currentUser available in all hbs wheneber a 
    // user is in the session
  }

  next();
  })
}

module.exports = passportBasicSetup;


