const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
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
        type: Boolean,
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

    followedPlaylists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artist'
        },
    ],
}, {
    timestamps: true
});

// Method to compare password with hashed password
userSchema.methods.matchPassword =  async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Hashing password
userSchema.pre("save", async function() {
    if(!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});



const User = mongoose.model('User', userSchema);

module.exports = User;