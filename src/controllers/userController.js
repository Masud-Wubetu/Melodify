const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

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
const loginUser = asyncHandler(async (req, res) => {
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
            token: generateToken(user._id)
        });
    } else {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error('Invalid email or password');
    }
});

//Get user profile
const getUserProfile =  asyncHandler(async (req, res) => {
    //Find the user
    const user = await User.findById(req.user._id)
        .select("-password")
        .populate("likedSongs", "title artist duration")
        .populate("likedAlbums", "title artist coverImage")
        .populate("followedArtists", "name image")
        .populate("followedPlaylists", "name creator coverImage");
        
    if(user) {
        res.status(StatusCodes.OK).json(user);
    }else {
        res.status(StatusCodes.NOT_FOUND)
        throw new Error("User Not Found!")
    }
});

//!update user profile
const updateProfileUser =  asyncHandler(async (req, res) => {});
//!Toggle like song
const toggleLikeSong =  asyncHandler(async (req, res) => {});
//!Toggle follow artist
const toggleFollowArtist =  asyncHandler(async (req, res) => {});
//!Toggle follow playlist
const toggleFollowPlaylist =  asyncHandler(async (req, res) => {});
//!get users
const getUsers =  asyncHandler(async (req, res) => {});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
}