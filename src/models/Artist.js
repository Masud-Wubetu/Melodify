const mongoose = require('mongoose');


const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Artist Name is required'],
        trim: true
    },

    bio: {
        type: String,
        trim: true
    },

    releaseDate: {
        type: Date,
        default: Date.now(),
    },

    image: {
        type: String,
        default: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg'
    },

    genres: [
      {
        type: String,
        ref: 'Song'
      }
    ],

    followers: {
        type: Number,
        default: 0
    },

    albums: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Album'
        }
    ],

    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Song'
        }
    ]

}, {
    timestamps: true
})

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;