const express = require('express');
const { createArtist, getArtists, getArtistsById, updateArtist } = require('../controllers/artistController');
const { protect, isAdmin }= require('../middlewares/auth');
const upload = require('../middlewares/upload')
const artistRouter = express.Router();

// Public
artistRouter.get('/', getArtists);
artistRouter.get('/:id', getArtistsById);
//Admin
artistRouter.post('/', protect, isAdmin, upload.single('image'), createArtist);
artistRouter.put('/:id', protect, isAdmin, upload.single('image'), updateArtist);

module.exports = artistRouter;