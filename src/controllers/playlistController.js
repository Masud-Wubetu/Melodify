const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const Artist = require('../models/Artist');
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const  uploadToCloudinary = require('../utils/cloudinaryUpload')

//!@desc - Create new Playlist
//@route - POST /api/playlists
//@Access - Private

const createPlaylist  = asyncHandler(async (req, res) => {
    const { name, description, isPublic } = req.body;
    //Validations
    if(!name || !description) {
        req.status(StatusCodes.BAD_REQUEST);
        throw new Error('Name and Description are required');
    }

    if(name.lenght < 3 && name.lenght > 50) {
        req.status(StatusCodes.BAD_REQUEST);
        throw new Error('Name must be between 3 and 50 characters');
    }

    if(description.length < 10 && description.length > 200) {
        req.status(StatusCodes.BAD_REQUEST);
        throw new Error('Desc ription must be between 10 and 20 0 characters');
    }

    // Check if playlist already exist
    const existingPlaylist = await Playlist.findOne({
        name,
        creator: req.user._id,
    }); 

    if(existingPlaylist) {
        req.status(StatusCodes.BAD_REQUEST);
        throw new Error('playlist with this name already exist');
    }

    // Upload playlist cover image if provided
     let coverImageUrl = '';
     if(req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/playlists');
        coverImageUrl = result.secure_url; 
     }

     // Create the playlist
     const playlist = await Playlist.create({
        name,
        description,
        creator: req.user._id,
        coverImage: coverImageUrl || undefined,
        isPublic: isPublic === 'true'
     });

     res.status(StatusCodes.CREATED).json(playlist);
});

//!@desc - Get Playlists with filtering and pagination
//@route - GET /api/playlists?search=summer&page=1&limit=10
//@Access - Public

const getPlaylists  = asyncHandler(async (req, res) => {});

//!@desc - get user's Playlist
//@route - GET /api/playlists/user/me
//@Access - Private

const getUserPlaylists = asyncHandler(async (req, res) => {});

//!@desc - Get playlist by Id
//@route - GET /api/playlists/:id
//@Access - Private

const getPlaylistById  = asyncHandler(async (req, res) => {});

//!@desc - Update Playlist
//@route - PUT /api/playlists/:id
//@Access - Private

const updatePlaylist  = asyncHandler(async (req, res) => {});

//!@desc - Delete Playlist
//@route - DELETE /api/playlist/:id
//@Access - Private

const deletePlaylist  = asyncHandler(async (req, res) => {});

//!@desc - Add songs to Playlist
//@route - PUT /api/playlists/:id/add-songs
//@Access - Private

const addSongsToPlaylist  = asyncHandler(async (req, res) => {});

//!@desc - Remove song from Playlist
//@route - PUT /api/playlists/:id/remove-song/:songId
//@Access - Private

const removeSongFromPlaylist  = asyncHandler(async (req, res) => {});

//!@desc - Add collaborator to Playlist
//@route - POST /api/playlists/:id/add-collaborator
//@Access - Private

const addCollaboratorToPlaylist  = asyncHandler(async (req, res) => {});

//!@desc - remove collaborator from Playlist
//@route - PUT /api/playlists/:id/remove-collabborator
//@Access - Private

const removeCollaboratorToPlaylist  = asyncHandler(async (req, res) => {});

//!@desc - Add collaborator to Playlist
//@route - GET /api/playlists/featured?limit=10
//@Access - Private

const getFeaturedPlaylists   = asyncHandler(async (req, res) => {});

module.exports = {
    createPlaylist,
    getPlaylists,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongsToPlaylist,
    removeSongFromPlaylist,
    addCollaboratorToPlaylist,
    removeCollaboratorToPlaylist,
    getFeaturedPlaylists,

}