const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../../models/user-model');

passport.use(new GoogleStrategy({
  clientID: process.env.googleClientId,
  clientSecret: process.env.googleClientSecret,
  callbackURL: '/google/callback',
  proxy: true // important for production
}, (accessToken, refreshToken, userInfo, cb) => {
  // console.log('Google acc: ', userInfo);
  const { displayName, emails } = userInfo;
  User.findOne({ $or: [
    // {email:email}
    { email: emails[0].value },
    { googleID: userInfo.id}
    ] })
    .then(user =>{
      if(user){
        cb(null, user) // log in user
        return;
      } 
      User.create({
        email: emails[0].value,
        fullName: displayName,
        googleID: userInfo.id
      })
      .then( newUser => {
        cb(null, newUser);
      })
      .catch( error => next(error));
    })
    .catch( error => next(error));

}))

