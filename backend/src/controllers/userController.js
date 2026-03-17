const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { uploadToCloudinary } = require('../middlewares/upload');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

//@desc - register User
//@route - POST /api/users/register
//@Access - Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, adminSecretCode } = req.body;

    if (!name || !email || !password) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please include all fields');
    }

    // Check if the user already exists
    const userExists = await prisma.user.findUnique({
        where: { email },
    });

    if (userExists) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine admin status
    const isAdmin = adminSecretCode === process.env.MELODIFY_ADMIN_SECRET;

    // Create new user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            isAdmin,
        },
    });

    if (user) {
        res.status(StatusCodes.CREATED).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            profilePicture: user.profilePicture,
            token: generateToken(user.id)
        });
    } else {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Invalid user data');
    }
});

//@desc - login User
//@route - POST /api/users/login
//@Access - Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find the User
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // Check if user exists and match password
    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(StatusCodes.OK).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            profilePicture: user.profilePicture,
            token: generateToken(user.id)
        });
    } else {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error('Invalid email or password');
    }
});

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            profilePicture: true,
            likedSongs: {
                select: { id: true, title: true, duration: true, artist: { select: { name: true } } }
            },
            likedAlbums: {
                select: { id: true, title: true, coverImage: true, artist: { select: { name: true } } }
            },
            followedArtists: {
                select: { id: true, name: true, image: true }
            },
            followedPlaylists: {
                select: { id: true, name: true, coverImage: true, creator: { select: { name: true } } }
            },
            createdAt: true,
            updatedAt: true,
        }
    });

    if (user) {
        // Map id to _id for frontend compatibility if needed, but the previous controller returned _id
        res.status(StatusCodes.OK).json({ ...user, _id: user.id });
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("User Not Found!");
    }
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    let dataToUpdate = { name, email };

    if (password) {
        const salt = await bcrypt.genSalt(10);
        dataToUpdate.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, "melodify/users");
        dataToUpdate.profilePicture = result.secure_url;
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: dataToUpdate,
        });

        res.status(StatusCodes.OK).json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            isAdmin: updatedUser.isAdmin,
        });
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User Not Found');
    }
});

// Toggle like song
const toggleLikeSong = asyncHandler(async (req, res) => {
    const songId = req.params.id;
    const userId = req.user.id;

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Song Not Found');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { likedSongs: { select: { id: true } } }
    });

    const isLiked = user.likedSongs.some(s => s.id === songId);

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            likedSongs: isLiked
                ? { disconnect: { id: songId } }
                : { connect: { id: songId } }
        },
        include: { likedSongs: { select: { id: true } } }
    });

    // Update play count / likes count on song
    await prisma.song.update({
        where: { id: songId },
        data: { likesCount: isLiked ? { decrement: 1 } : { increment: 1 } }
    });

    res.status(StatusCodes.OK).json({
        likedSongs: updatedUser.likedSongs.map(s => s.id),
        message: isLiked ? 'Song removed from liked Songs' : 'Song added to liked Songs'
    });
});

// Toggle follow artist
const toggleFollowArtist = asyncHandler(async (req, res) => {
    const artistId = req.params.id;
    const userId = req.user.id;

    const artist = await prisma.artist.findUnique({ where: { id: artistId } });
    if (!artist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not Found');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { followedArtists: { select: { id: true } } }
    });

    const isFollowing = user.followedArtists.some(a => a.id === artistId);

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            followedArtists: isFollowing
                ? { disconnect: { id: artistId } }
                : { connect: { id: artistId } }
        },
        include: { followedArtists: { select: { id: true } } }
    });

    await prisma.artist.update({
        where: { id: artistId },
        data: { followersCount: isFollowing ? { decrement: 1 } : { increment: 1 } }
    });

    res.status(StatusCodes.OK).json({
        followedArtists: updatedUser.followedArtists.map(a => a.id),
        message: isFollowing ? 'Artist unfollowed' : 'Artist followed'
    });
});

// Toggle follow playlist
const toggleFollowPlaylist = asyncHandler(async (req, res) => {
    const playlistId = req.params.id;
    const userId = req.user.id;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Playlist Not Found');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { followedPlaylists: { select: { id: true } } }
    });

    const isFollowing = user.followedPlaylists.some(p => p.id === playlistId);

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            followedPlaylists: isFollowing
                ? { disconnect: { id: playlistId } }
                : { connect: { id: playlistId } }
        },
        include: { followedPlaylists: { select: { id: true } } }
    });

    await prisma.playlist.update({
        where: { id: playlistId },
        data: { followersCount: isFollowing ? { decrement: 1 } : { increment: 1 } }
    });

    res.status(StatusCodes.OK).json({
        followedPlaylists: updatedUser.followedPlaylists.map(p => p.id),
        message: isFollowing ? 'Playlist unfollowed' : 'Playlist followed'
    });
});

// Get all users (Admin only)
const getUsers = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            profilePicture: true,
            createdAt: true,
        }
    });
    // Map id to _id for frontend compatibility
    const mappedUsers = users.map(u => ({ ...u, _id: u.id }));
    res.status(StatusCodes.OK).json(mappedUsers);
});

// Delete user (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id }
        });
        res.status(StatusCodes.OK).json({ message: 'User removed' });
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User not found');
    }
});

// Toggle admin status (Admin only)
const toggleAdminStatus = asyncHandler(async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.params.id },
            data: { isAdmin: req.body.isAdmin }
        });
        res.status(StatusCodes.OK).json({ message: 'User updated' });
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    toggleLikeSong,
    toggleFollowArtist,
    toggleFollowPlaylist,
    getUsers,
    deleteUser,
    toggleAdminStatus,
};