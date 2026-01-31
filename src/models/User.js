const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Name is required'],
        trim: true
    },
    email: {
        type:String,
        required: [true, 'Email is required'],
        trim: true
    },
    password: {
        type:String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    profile: {
        type: String,
        default: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg'
    },
    isAdmin: {
        type: String,
        default: false
    },
    likedSongs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Song'
        },
    ],

    likedAlbums: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Album'
        },
    ],

    followedArtists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artist'
        },
    ],

    followedPlayLists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artist'
        },
    ],
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

module.exports = User;