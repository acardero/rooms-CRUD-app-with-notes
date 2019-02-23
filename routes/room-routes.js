const express = require('express');
const router  = express.Router();

const Room = require('../models/room-model');
const User = require('../models/user-model');
const Review = require('../models/review-model');

const fileUploader = require('../config/upload-setup/cloudinary');

/* GET home page */
router.get('/rooms/add', isLoggedIn, (req, res, next) => {
  res.render('room-pages/addRoom');
});

                      /* <input type="file" name="imageUrl"> */
router.post('/create-room', fileUploader.single('imageUrl'), (req, res, next) => {
  // *** test console.log ***
  // console.log('Body: ', req.body);
  // console.log('****************')
  // console.log('file: ', req.file);
  const { name, description } = req.body
  Room.create({
    name,
    description, 
    imageUrl: req.file.secure_url,
    owner: req.user._id
  })
  .then( newRoom => {
    // console.log('Room created: ', newRoom);
    res.redirect('/rooms');
  })
  .catch( error => next(error))
})

// list rooms
router.get('/rooms', (req,res,next) => {
  Room.find()
  .then(roomsFromDB => {
    roomsFromDB.forEach(oneRoom => {
      if(req.user){
        if(oneRoom.owner.equals(req.user._id)){
          oneRoom.isOwner = true;
        }
      }
    })
    res.render('room-pages/room-list', {roomsFromDB});
  })
})

// details
router.get('/room/:roomId', (req,res,next) => {
  const theRoomId = req.params.roomId;
  Room.findById(theRoomId).populate({path: 'reviews', populate : {path : 'user'}})
  // .populate({path: 'reviews', populate: {path: 'user'}})
  .then( theRoom => {
    if(req.user){
      if( theRoom.owner.equals(req.user._id)){
        theRoom.isOwner = true;
      }
      // console.log('Request room is: ', theRoom);
    res.render('room-pages/room-details', {theRoom});
    } else {
      res.redirect('/login')
    }
  })
  .catch(error => next(error))
})

// delete
router.post('/room/:theRoomId/delete', (req,res,next) => {
  Room.findByIdAndDelete(req.params.theRoomId)
  .then( theRoom => {
    // console.log('Deleted room: ', theRoom);
    res.redirect('/rooms');
  })
  .catch(error => next(error));
})


//render edit page
router.get('/room/:theRoomId/edit', (req,res,next) => {
  Room.findById(req.params.theRoomId)
  .then( foundRoom => {
    res.render('room-pages/edit-room', {foundRoom});
  })
})

//edit 
// form action="/rooms/{{foundRoom._id}}/edit-room" method="POST"

router.post('/rooms/:theRoomId/edit-room', fileUploader.single('imageUrl'), (req,res,next) => {
  const {name, description} = req.body;
  
  const updatedRoom = {
    name,
    description,
    owner: req.user._id
  }
  if(req.file){
    updatedRoom.imageUrl = req.file.secure_url
  }
  Room.findByIdAndUpdate(req.params.theRoomId, updatedRoom)
  .then( updateRoom => {
    res.redirect(`/room/${req.params.theRoomId}`)
  })
  .catch(error => next(error));
})

// review route
// form action="/create-review" method="POST"
router.post('/room/:theRoomId/create-review', (req,res,next) => {
  Review.create({
    user: req.user,
    comment: req.body.comment
  })
  .then( newReivew => {
    Room.findById(req.params.theRoomId).populate('owner')
  .then (foundRoom => {
    foundRoom.reviews.push(newReivew._id)
    foundRoom.save()
    .then( room => {
      res.redirect(`/room/${room._id}`)
    })
  })
  .catch(error => next(error))
  })
.catch(error => next(error))
})




function isLoggedIn(req, res, next){
 if(req.user){
   next()
 } else {
  res.redirect('/login')
 }
}

module.exports = router;
