const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

  email: String,
  password: String,
  fullName: String,
  slackID: String,
  googleID: String


}, {
  timestamps: true
});

// const User = mongoose.model('User', userSchema);
// module.exports = User;

// **Optional short hand**
module.exports = mongoose.model('User', userSchema);