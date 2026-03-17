const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');
const prisma = require('./lib/prisma');

const userRouter = require('./routes/userRoutes');
const artistRouter = require('./routes/artistRoutes');
const albumRouter = require('./routes/albumRoutes');
const songRouter = require('./routes/songRoutes');
const playlistRouter = require('./routes/playlistRoutes');
const adminRouter = require('./routes/adminRoutes');

// Initialize app
const app = express();

// Verify Database Connection
prisma.$connect()
    .then(() => {
        console.log("PostgreSQL Connected via Prisma...");
    })
    .catch((err) => {
        console.error('Error Connecting to PostgreSQL:', err.message);
    });

// pass incoming data
app.use(express.json());

// Allow requests from frontend
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests) and all other origins during development
        return callback(null, true);
    },
    credentials: true // allows cookies/auth if needed
}));

// Routes
app.use('/api/users', userRouter);
app.use('/api/artists', artistRouter);
app.use('/api/albums', albumRouter);
app.use('/api/songs', songRouter);
app.use('/api/playlists', playlistRouter);
app.use('/api/admin', adminRouter);

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