const express = require('express');
const userRouter = express.Router();
const {
       registerUser,
       loginUser,
       getUserProfile,
       updateUserProfile,
       toggleLikeSong,
       toggleFollowArtist,
       toggleFollowPlaylist,
       getUsers,
       deleteUser,
       toggleAdminStatus } = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// Private routes
userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, upload.single("profilePicture"), updateUserProfile);
userRouter.put('/like-song/:id', protect, toggleLikeSong);
userRouter.put('/follow-artist/:id', protect, toggleFollowArtist);
userRouter.put('/follow-playlist/:id', protect, toggleFollowPlaylist);

// Admin routes
userRouter.get('/', protect, isAdmin, getUsers);
userRouter.delete('/:id', protect, isAdmin, deleteUser);
userRouter.put('/:id/admin', protect, isAdmin, toggleAdminStatus);


module.exports = userRouter;