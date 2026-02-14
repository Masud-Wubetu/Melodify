const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');
const  uploadToCloudinary = require('../utils/cloudinaryUpload')

//@desc - Create new Artist
//@route - POST /api/artist
//@Access - Private

const createArtist = asyncHandler(async (req, res) => {
    // Check if req.body is defined
    if(!req.body) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Request body is required');
    }
    const { name, bio, genres } = req.body;

    //Validations
    if(!name || !bio || !genres) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Name, Bio, Genres are required');
    }

    // Check if Artist already exists
    const existingArtist = await Artist.findOne({ name });
    if(existingArtist) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Artist already exists');
    }

    //upload artist image if provided
    let imageUrl = "";
    if(req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/artists');
        imageUrl = result.secure_url;
    }

    // Create artist
    const artist = await Artist.create({
        name,
        bio,
        genres,
        isVerified: true,
        image: imageUrl,
    });
    res.status(StatusCodes.CREATED).json(artist);
});

//@desc - get all Artists with filtering and pagination
//@route - GET /api/artist?genre=Rock&search=dark&page=1&limit=10
//@Access - Public

const getArtists = asyncHandler(async (req, res) => {
    const { genre, search, page=1, limit=10 } = req.query;
    // Build filter object
    const filter = {};
    if(genre) filter.genres = {$in:[genre]};
    if(search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { bio: { $regex: search, $options: 'i' } },
        ];
    }

    // Count total artist with the filter
    const count = await Artist.countDocuments(filter);
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Get artists
    const artists = await Artist.find(filter)
        .sort({ followers: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        res.status(StatusCodes.OK).json({
            artists,
            page: parseInt(page),
            pages: Math.ceil(count / parseInt(limit)),
            totalArtist: count,
        });
});

//!@desc - Get artist by id
//@route - GET/api/artist/id
//@Access - Public

const getArtistsById = asyncHandler(async (req, res) => {
    const artist = await Artist.findById(req.params.id);
    if(artist) {
        res.status(StatusCodes.OK).json(artist);
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not found');
    }
});

//@desc - Update artist
//@route - PUT /api/artist/id
//@Access - Private/Admin

const updateArtist =  asyncHandler(async (req, res) => {
    const { name, bio, genres, isVerified } = req.body;
    const artist = await Artist.findById(req.params.id);
    if(!artist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not Found');
    }
    // Update Artist details
    artist.name = name || artist.name;
    artist.bio = bio || artist.bio;
    artist.genres = genres || artist.genres;
    artist.isVerified = 
        isVerified !== undefined ? isVerified === 'true' : artist.
        isVerified;
    // Update image if provided
    if(req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/artists');
        artist.image = result.secure_url;
    }
    // reSave
    const updatedArtist = await artist.save();
    res.status(StatusCodes.OK).json(updatedArtist);
});

//@desc - Delete artist
//@route - DELETE /api/artist/id
//@Access - Private/Admin

const deleteArtist =  asyncHandler(async (req, res) => {
    const artist = await Artist.findById(req.params.id);
     if(!artist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not Found');
    }
    // Delete all songs by artist
    await Song.deleteMany({ artist: artist._id });

    // Delete all albums by artist
    await Album.deleteMany({ artist: artist._id });
    await artist.deleteOne();
    res.status(StatusCodes.OK).json({ message: 'Artist removed'});
});

//@desc - Get 10 top artists by followers
//@route - POST /api/artists/top?limit=10
//@Access - Public

const getTopArtists = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const artists = await Artist.find()
        .sort({ followers: -1 })
        .limit(parseInt(limit));
    res.status(StatusCodes.OK).json(artists);
});

//@desc - Get Artist's top Song
//@route - POST /api/artists/:id/top-songs?limit=5
//@Access - Public

const getArtistTopSongs = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const songs = await Song.find()
        .sort({ followers: -1 })
        .limit(parseInt(limit))
        .populate('album', 'title coverImage');

    if(songs.length > 0) {
        res.status(StatusCodes.OK).json(songs);
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('No songs found for this artist');
    }
});

module.exports = {
    createArtist,
    getArtists,
    getArtistsById,
    updateArtist,
    deleteArtist,
    getTopArtists,
    getArtistTopSongs
}