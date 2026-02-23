const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const Artist = require('../models/Artist')
const Song = require('../models/Song');
const generateToken = require('../utils/generateToken');
const  uploadToCloudinary  = require('../utils/cloudinaryUpload');


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

//update user profile
const updateUserProfile =  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { name, email, password } = req.body;
    if(user) {
        user.name = name || user.name;
        user.email = email || user.email;
        // Check if password is being updated
        if(password) {
            user.password = password;
        }
    
        // Upload Profile Picture if Provided
        if(req.file) {
            const result = await uploadToCloudinary(req.file.path, "melodify/users");
            user.profilePicture = result.secure_url;
        }
    
        const updatedUser = await user.save();
        res.status(StatusCodes.OK).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User Not Found');
    }
    
});
//Toggle like song
const toggleLikeSong =  asyncHandler(async (req, res) => {
    const songId = req.params.id;
    const user = await User.findById(req.user._id);
    const song = await Song.findById(songId);

     if(!song) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Song Not Found');
    }

    if(!user) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User Not Found');
    }

    // Check if song is already liked
    const songIndex = user.likedSongs.indexOf(songId);
    if(songIndex === -1) {
        // Add song to liked songs
        user.likedSongs.push(songId);

        // Increase the song likes count
        song.likes += 1;
    } else {
        // Remove song to liked songs
        user.likedSongs.splice(songIndex, 1);

        // Decrement likes count (ensure it doesn't go below 0)
        if(song.likes > 0) {
            song.likes -= 1;
        }
    }

    await Promise.all([user.save(), song.save()]);
    res.status(StatusCodes.OK).json({
        likedSongs: user.likedSongs,
        message: songIndex === -1 ? 'Song added to liked Songs' : 'Song removed from liked Songs'
    });
});
//Toggle follow artist
const toggleFollowArtist =  asyncHandler(async (req, res) => {
    const artistId = req.params.id;

    const artist = await Artist.findById(artistId );
    if(!artist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not Found');
    }

    const user = await User.findById(req.user._id);
    if(!user) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User Not Found');
    }

    // Check if artist is already followed
    const artistIndex = user.followedArtists.indexOf(artistId);
     if(artistIndex === -1) {
        // Add artist to followed artist
        user.followedArtists.push(artistId);

        // Increase the followers count
        artist.followers += 1;
        await artist.save();

    } else {
        // Remove artist from followed artists
        user.followedArtists.splice(artistIndex, 1);

        // Decrement follower's count (ensure it doesn't go below 0)
        if(artist.followers > 0) {
            artist.followers -= 1;
        }
    }

    await Promise.all([user.save(), artist.save()]);
    res.status(StatusCodes.OK).json({
        followedArtists: user.followedArtists,
        message: songIndex === -1 ? 'Artist followed' : 'Artist unfollowed'
    });

});
//!Toggle follow playlist
const toggleFollowPlaylist =  asyncHandler(async (req, res) => {});
//!get users
const getUsers =  asyncHandler(async (req, res) => {});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    toggleLikeSong,
    toggleFollowArtist,
}