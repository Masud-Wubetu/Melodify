const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');
const  uploadToCloudinary = require('../utils/cloudinaryUpload')

//@desc - Create new Album
//@route - POST /api/albums
//@Access - Private/Admin

const createAlbum = asyncHandler(async (req, res) => {});

//@desc - Get all Albums with filtering and pagination
//@route - GET /api/albums
//@Access - Public

const getAlbums = asyncHandler(async (req, res) => {});

//@desc - Get albums by id 
//@route - GET /api/albums/:id
//@Access - Public

const getAlbumById = asyncHandler(async (req, res) => {});

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