const passport = require('passport');
const SlackStrategy = require('passport-slack').Strategy;

// do not need bcrypt since it takes account info directly from slack

const User = require('../../models/user-model');

passport.use(new SlackStrategy({
  // clientId & clientSecret are given names from slack API
  // slackClientid is from .env with private credentials
  clientID: process.env.slackClientId,
  clientSecret: process.env.slackClientSecret,
  callbackURL: '/slack/callback',
  proxy: true // important during production
}, ( accessToken, refreshToken, userInfo, cb) => {
  // console.log('Who is this: ', userInfo);

  // es6 destructing
  const { email, name } = userInfo.user;
  User.findOne({ $or: [
    // {email:email}
    { email },
    { slackID: userInfo.user.id}
    ] })
  .then( user => {
  if(user){
    // log the user in if in DB
    cb(null, user);
    return
  }
  User.create({
    email,
    fullName: name,
    slackID: userInfo.user.id
  })
  .then( newUser => {
  cb(null, newUser);
  })
    .catch( error => next(error)) // closes User.create
  })
  .catch( error => next(error)) // closes User.findOne
} ))
