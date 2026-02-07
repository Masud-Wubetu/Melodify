const express = require('express');
const { createArtist, getArtists, getArtistsById } = require('../controllers/artistController');
const { protect, isAdmin }= require('../middlewares/auth');
const upload = require('../middlewares/upload')
const artistRouter = express.Router();

// Public
artistRouter.get('/', getArtists);
artistRouter.get('/:id', getArtistsById);
//Admin
artistRouter.post('/', protect, isAdmin, upload.single('image'), createArtist);

module.exports = artistRouter;