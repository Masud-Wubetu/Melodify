const express = require('express');
const userRouter = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/auth')

// Public routes
userRouter.post('/register', registerUser );
userRouter.post('/login', loginUser);

// Private routes
userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, updateUserProfile);


module.exports = userRouter;