const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');

//@desc - register a new user
//@route - POST /api/users/register
//@Access - Public

const registerUser = asyncHandler( async (req, res) => {
    // Get the payload
    const { name, email, password } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if(userExists) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('User already exists')
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password,    
    });

    if(user) {
        res.status(StatusCodes.CREATED).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            password: user.password,
            isAdmin: user.isAdmin,
            profilePicture: user.profilePicture,
        });
    }else {
        res.status(StatusCodes.BAD_REQUEST);
    }
});

//@desc - login User
//@route - POST /api/users/login
//@Access - Public
const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body;
    //Find the User
    const user = await User.findOne({ email });
    
    // Check if user exists and match password
    if(user && (await user.matchPassword(password))) {
        res.status(StatusCodes.OK).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            profilePicture: user.profilePicture,
            token: 'token here'
        });
    } else {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error('Invalid email or password');
    }
});

module.exports = {
    registerUser,
    loginUser,
}