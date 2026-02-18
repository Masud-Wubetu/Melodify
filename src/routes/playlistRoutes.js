const express = require('express');
const {
    createPlaylist,
    getPlaylists,
    getUserPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongsToPlaylist,
    removeSongFromPlaylist,
    addCollaboratorToPlaylist,
    removeCollaboratorToPlaylist,
    getFeaturedPlaylists,} = require('../controllers/platlistController');
const { protect, isAdmin }= require('../middlewares/auth');
const upload = require('../middlewares/upload')
const playlistRouter = express.Router(); 

