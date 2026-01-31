const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variable
dotenv.config();

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

//Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server is Running on port', PORT)
})