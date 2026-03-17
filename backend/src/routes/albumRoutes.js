const express = require('express');
const { createAlbum,
    getAlbums,
    getAlbumById,
    updateAlbum,
    deleteAlbum,
    addSongsToAlbum,
    removeSongFromAlbum,
    getNewReleases,
} = require('../controllers/albumController');
const { protect, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload')
const albumRouter = express.Router();

// Public routes
// Public routes
albumRouter.get('/', getAlbums);
albumRouter.get('/new-releases', getNewReleases); // Moved up to avoid conflict with /:id
albumRouter.get('/:id', getAlbumById);

// private routes
albumRouter.post('/', protect, isAdmin, upload.single('coverImage'), createAlbum);
albumRouter.put('/:id', protect, isAdmin, upload.single('coverImage'), updateAlbum);
albumRouter.delete('/:id', protect, isAdmin, deleteAlbum);
albumRouter.put('/:id/add-songs', protect, isAdmin, addSongsToAlbum);
albumRouter.delete('/:id/remove-song/:songId', protect, isAdmin, removeSongFromAlbum);

module.exports = albumRouter;