const dotenv = require('dotenv');
dotenv.config();

require('./models/Song');
require('./models/Artist');
require('./models/Album');
require('./models/Playlist');

const express = require('express');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes')
const userRouter = require('./routes/userRoutes');
const artistRouter = require('./routes/artistRoutes');
const albumRouter = require('./routes/albumRoutes');
const songRouter = require('./routes/songRoutes');
const playlistRouter = require('./routes/playlistRoutes');

// Initialize app
const app = express();

// Connect to database
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Database Connected...")
    })
    .catch((err) => {
        console.log('Error Connecting to database', err.message)
    });

// pass incoming data
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
app.use('/api/artists', artistRouter);
app.use('/api/albums', albumRouter);
app.use('/api/songs', songRouter);
app.use('/api/playlists', playlistRouter);

// Error handling
//404
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = StatusCodes.NOT_FOUND;
    next(error);
});

 // Global error handler
app.use((err, req, res, next) => {
    // Default error
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(status).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

//Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server is Running on port', PORT)
});