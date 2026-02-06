const express = require('express');
const { createArtist } = require('../controllers/artistController');
const { protect }= require('../middlewares/auth');
const upload = require('../middlewares/upload')
const artistRouter = express.Router();

// Public

//Admin
artistRouter.post('/', protect, upload.single('image'), createArtist);

module.exports = artistRouter;