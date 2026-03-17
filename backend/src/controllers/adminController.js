const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Playlist = require('../models/Playlist');

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    const [userCount, songCount, artistCount, albumCount, playlistCount] = await Promise.all([
        User.countDocuments(),
        Song.countDocuments(),
        Artist.countDocuments(),
        Album.countDocuments(),
        Playlist.countDocuments(),
    ]);

    res.json({
        users: userCount,
        songs: songCount,
        artists: artistCount,
        albums: albumCount,
        playlists: playlistCount,
    });
});

module.exports = {
    getAdminStats,
};
