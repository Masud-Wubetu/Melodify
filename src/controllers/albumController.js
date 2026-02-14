const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');
const  uploadToCloudinary = require('../utils/cloudinaryUpload')

//@desc - Create new Album
//@route - POST /api/albums
//@Access - Private/Admin

const createAlbum = asyncHandler(async (req, res) => {

    if(!req.body) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Request body is required');
    }
    const { title, artistId, releaseDate, genre, description, 
        isExplicit } = req.body;
    // Validations
    if(!title || !artistId || !releaseDate || !genre || !description) {
         es.status(StatusCodes.BAD_REQUEST);
        throw new Error(
            'title, artistId, releaseDate, genre and description are required.'
        );
    }

    if (title.length < 3 || title.length > 100) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Title must be between 3 and 100 characters');
    }

    if (description.length < 10 || description.length > 200) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Description must be between 10 and 200 characters');
    }

    
    // Check if album already exists
    const albumExists = await Album.findOne({ title });
    if(albumExists) {
        res.status(StatusCodes.CONFLICT);
        throw new Error('Album already exist.');
    }
    
    // Check if artists already exists
    const artist = await Artist.findById(artistId);
    if(!artist) {
            res.status(StatusCodes.NOT_FOUND);
            throw new Error('Artist Not FOUND.');
    }

    // upload coverImage if provided
    let coverImageUrl = ""
    if(req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/albums');
        coverImageUrl = result.secure_url;
    }
    // Create album
    const album = await Album.create({
        title,
        artist: artistId,
        releaseDate: releaseDate ? new Date(releaseDate) : Date.now(),
        coverImage: coverImageUrl || undefined,
        genre,
        description,
        isExplicit: isExplicit === 'true'
    });

    // add album to artist's albums
    artist.albums.push(album._id);
    await artist.save();
    res.status(StatusCodes.CREATED).json(album);

});

//@desc - Get all Albums with filtering and pagination
//@route - GET /api/albums?genre=Rock&artist=892457&search=dark&page=1&limit=10
//@Access - Public

const getAlbums = asyncHandler(async (req, res) => {
    const { genre, artist, search, page=1, limit=10 } = req.query;
    // Build filter object
    const filter = {};
    if(genre) filter.genre = genre;
    if(artist) filter.artist = artist;

    if(search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { genre: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    // Count total album with the filter
    const count = await Album.countDocuments(filter);
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Get artists
    const albums = await Album.find(filter)
        .sort({ releaseDate: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate("artist", "name image")
    res.status(StatusCodes.OK).json({
        albums,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        totalAlbum: count,
    });
});

//@desc - Get albums by id 
//@route - GET /api/albums/:id
//@Access - Public

const getAlbumById = asyncHandler(async (req, res) => {
    const album = await Album.findById(req.params.id)
        .populate("artist", "name image bio");
    if(album) {
        res.status(StatusCodes.OK).json(album);
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Album Not found');
    }
});

//@desc - Update Album details
//@route - PUT /api/albums/:id
//@Access - Private/Admin

const updateAlbum = asyncHandler(async (req, res) => {});

//@desc - Delete Album
//@route - DELETE /api/albums/:id
//@Access - Private/Admin

const deleteAlbum = asyncHandler(async (req, res) => {});

//@desc - Add Songs to Album
//@route - PUT /api/albums/:id/add-songs
//@Access - Private/Admin

const addSongsToAlbum = asyncHandler(async (req, res) => {});

//@desc - remove song from Album
//@route - POST /api/albums/:id/remove-song/:songId
//@Access - Private/Admin

const removeSongFromAlbum = asyncHandler(async (req, res) => {});

//@desc - Get new releases (recently added albums)
//@route - POST /api/albums/new-releases?limit=10
//@Access - Public

const getNewReleases = asyncHandler(async (req, res) => {});

module.exports = {
    createAlbum,
    getAlbums,
    getAlbumById,
    updateAlbum,
    deleteAlbum,
    addSongsToAlbum,
    removeSongFromAlbum,
    getNewReleases,
}