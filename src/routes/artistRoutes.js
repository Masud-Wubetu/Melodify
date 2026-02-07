const express = require('express');
const { createArtist, getArtists } = require('../controllers/artistController');
const { protect, isAdmin }= require('../middlewares/auth');
const upload = require('../middlewares/upload')
const artistRouter = express.Router();

// Public
artistRouter.get('/', getArtists);
//Admin
artistRouter.post('/', protect, isAdmin, upload.single('image'), createArtist);

module.exports = artistRouter;