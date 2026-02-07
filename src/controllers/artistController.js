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
        const result = uploadToCloudinary(req.file.path, 'melodify/artists');
        imageUrl = result.Secure_url;
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
//@route - GET/api/artist?genre=Rock 
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

module.exports = {
    createArtist,
    getArtists,
    getArtistsById,
}