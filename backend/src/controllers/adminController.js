const asyncHandler = require('express-async-handler');
const prisma = require('../lib/prisma');

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    const [userCount, songCount, artistCount, albumCount, playlistCount] = await Promise.all([
        prisma.user.count(),
        prisma.song.count(),
        prisma.artist.count(),
        prisma.album.count(),
        prisma.playlist.count(),
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
