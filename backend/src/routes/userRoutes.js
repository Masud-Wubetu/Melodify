const express = require('express');
const userRouter = express.Router();
const { 
       registerUser, 
       loginUser, 
       getUserProfile, 
       updateUserProfile, 
       toggleLikeSong, 
       toggleFollowArtist, 
       toggleFollowPlaylist } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public routes
userRouter.post('/register', registerUser );
userRouter.post('/login', loginUser);

// Private routes
userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, upload.single("profilePicture"), updateUserProfile);
userRouter.put('/like-song/:id', protect, toggleLikeSong );
userRouter.put('/follow-artist/:id', protect, toggleFollowArtist );
userRouter.put('/follow-playlist/:id', protect, toggleFollowPlaylist);


module.exports = userRouter;