const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

// Middleware to protect routes - verify JWT token and set req.user
const protect = asyncHandler(async( req, res, next) => {
    let token;
    // Check if user attaching token to the header
    if(!req.headers.authorization) {
        res.status(StatusCodes.UNAUTHORIZED)
        throw new Error('no token provided in the header');
    }

    // Check if token exists in Authorization header
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get the token from the header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Set req.user to the user found in the token 
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.log(error);
            res.status(StatusCodes.UNAUTHORIZED);
            return next(error);
        }
    }else {
        const error = new Error('Not authorized, no token');
        error.status = StatusCodes.UNAUTHORIZED;
        return next(error);
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    if(req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(StatusCodes.FORBIDDEN)
        throw new Error('Not authorized as an admin')
    }
});

module.exports = {
    protect,
    isAdmin,
}