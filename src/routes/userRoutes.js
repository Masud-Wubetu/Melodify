const express = require('express');
const userRouter = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public routes
userRouter.post('/register', registerUser );
userRouter.post('/login', loginUser);

// Private routes
userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, upload.single("profilePicture"), updateUserProfile);


module.exports = userRouter;