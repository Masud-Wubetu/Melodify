const express = require('express');
const { createArtist } = require('../controllers/artistController');
const { protect, isAdmin }= require('../middlewares/auth');
const upload = require('../middlewares/upload')
const artistRouter = express.Router();

// Public

//Admin
artistRouter.post('/', protect, isAdmin, upload.single('image'), createArtist);

module.exports = artistRouter;