const express = require('express');
const userRouter = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/auth')

userRouter.post('/register', registerUser );
userRouter.post('/login', loginUser);
userRouter.get('/profile', protect, getUserProfile);

module.exports = userRouter;