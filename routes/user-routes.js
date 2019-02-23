const express = require('express');
const router  = express.Router();



/* GET home page */
router.get('/profile', (req, res, next) => {
  if(!req.user){
    req.flash('error', 'You need to be logged in to view this page');
    res.redirect('/login');
    return;
  }
  res.render('user-pages/profile-page');
});


router.get('/public', (req,res,next) => {
  res.render('user-pages/public-page');
})








module.exports = router;
