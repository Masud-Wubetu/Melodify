const express = require('express');
const {
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
    getFeaturedPlaylists, } = require('../controllers/playlistController');
const { protect, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload')
const playlistRouter = express.Router();

// Public routes
playlistRouter.get('/', getPlaylists);
playlistRouter.get('/featured', getFeaturedPlaylists);
playlistRouter.get('/user/me', protect, getUserPlaylists);
playlistRouter.get('/:id', getPlaylistById);

//Private routes
playlistRouter.post('/', protect, upload.single('coverImage'), createPlaylist);
playlistRouter.put('/:id', protect, upload.single('coverImage'), updatePlaylist);
playlistRouter.delete('/:id', protect, deletePlaylist);
playlistRouter.put('/:id/add-songs', protect, addSongsToPlaylist);
playlistRouter.put('/:id/remove-song/:songId', protect, removeSongFromPlaylist);
playlistRouter.put('/:id/add-collaborator', protect, addCollaboratorToPlaylist);
playlistRouter.put('/:id/remove-collaborator', protect, removeCollaboratorToPlaylist);

module.exports = playlistRouter;



