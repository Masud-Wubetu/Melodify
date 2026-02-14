const express = require('express');
const {createSong,
       getSongs,
       getSongById,
       updateSong,
       deleteSong,
       getTopSongs,
       getNewReleases
} = require('../controllers/songController')
const { protect, isAdmin }= require('../middlewares/auth');
const upload = require('../middlewares/upload')
const songRouter = express.Router();

// Configure multer to handle multiple file
const songUpload = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]);

// Public routes
songRouter.get('/', getSongs);
songRouter.get('/top', getTopSongs);
songRouter.get('/:id', getSongById);
songRouter.get('/new-releases', getNewReleases);

// private routes
songRouter.post('/', protect, isAdmin, songUpload, createSong);
songRouter.put('/:id', protect, isAdmin, songUpload, updateSong);
songRouter.delete('/:id', protect, isAdmin, deleteSong);


module.exports = songRouter;