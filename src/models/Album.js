const mongoose = require('mongoose');


const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        require: [true, 'album title is required'],
        trim: true
    },

    artist: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Artist is required'],
        ref: 'Artist'
    },

    releaseDate: {
        type: Date,
        default: Date.now(),
    },

    coverImage: {
        type: String,
        default: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg'
    },

    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
      }
    ],

    genre: {
        type: String,
        trim: true
    },

    likes: {
        type: Number,
        default: 0
    },
    
    description: {
        type: String,
        default: 0
    },
    
    isExplicit: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true
})

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;