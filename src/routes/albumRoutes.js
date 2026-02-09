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
const { protect, isAdmin }= require('../middlewares/auth');
const upload = require('../middlewares/upload')
const albumRouter = express.Router();

// Public routes
albumRouter.get('/', getAlbums);
albumRouter.get('/:id', getAlbumById);
albumRouter.get('/new-releases', getNewReleases);

// private routes
albumRouter.post('/', protect, isAdmin, upload.single('coverImage'), createAlbum);
albumRouter.put('/:id', protect, isAdmin, upload.single('coverImage'), updateAlbum);
albumRouter.delete('/:id', protect, isAdmin, deleteAlbum);
albumRouter.get('/:id/add-songs', protect, isAdmin, addSongsToAlbum);
albumRouter.delete('/:id/remove-song/:songId', protect, isAdmin, removeSongFromAlbum);

module.exports = albumRouter;