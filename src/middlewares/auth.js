const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

// Middleware to protect routes - verify JWT token and set req.user
const protect = asyncHandler(async( req, res) => {
    let token;

    // Check if token exists in Authorization header
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get the token from the header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT);

            // Set req.user to the user found in the token 
            req.user = await User.findById(decoded.id).select('-password');
            console.log(req.user);
        } catch (error) {
            console.log(error);
            res.status(StatusCodes.UNAUTHORIZED);
            throw new Error('Not authorized, token failed!')
        }
    }
});

module.exports = {
    protect,
}