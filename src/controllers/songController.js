const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');
const  uploadToCloudinary = require('../utils/cloudinaryUpload')

//@desc - Create new Song
//@route - POST /api/songs
//@Access - Private/Admin

const createSong =  asyncHandler(async (req, res) => {});

//@desc - get all songs with filtering and pagination
//@route - GET /api/songs
//@Access - Public

const getSongs =  asyncHandler(async (req, res) => {});

//@desc - get a Song by Id
//@route - GET /api/songs/:id
//@Access - Public

const getSongById =  asyncHandler(async (req, res) => {});

//@desc - update song detail
//@route - PUT /api/songs/:id
//@Access - Private/Admin

const updateSong =  asyncHandler(async (req, res) => {});

//@desc - Delete Song
//@route - DELETE /api/songs/:id
//@Access - Private/Admin

const deleteSong =  asyncHandler(async (req, res) => {});

//@desc - get top songs by plays
//@route - GET /api/songs/top?limit=5
//@Access - Public

const getTopSongs =  asyncHandler(async (req, res) => {});

//@desc - get new releases (recently added songs)
//@route - GET /api/songs/new-releases?limit=5
//@Access - Public

const getNewReleases =  asyncHandler(async (req, res) => {});

module.exports = {
    createSong,
    getSongs,
    getSongById,
    updateSong,
    deleteSong,
    getTopSongs,
    getNewReleases 
}