const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const prisma = require('../lib/prisma');
const { uploadToCloudinary } = require('../middlewares/upload');

//@desc - create Artist
//@route - POST /api/artists
//@Access - Private/Admin
const createArtist = asyncHandler(async (req, res) => {
    const { name, bio, genres, isVerified } = req.body;

    if (!name) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Artist Name is required');
    }

    let imageUrl = 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg';
    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/artists');
        imageUrl = result.secure_url;
    }

    const artist = await prisma.artist.create({
        data: {
            name,
            bio,
            genres: Array.isArray(genres) ? genres : (genres ? genres.split(',').map(g => g.trim()) : []),
            image: imageUrl,
        }
    });

    res.status(StatusCodes.CREATED).json({ ...artist, _id: artist.id });
});

//@desc - Get all artists with pagination
//@route - GET /api/artists
//@Access - Public
const getArtists = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    const filter = search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { bio: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};

    const count = await prisma.artist.count({ where: filter });
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const artists = await prisma.artist.findMany({
        where: filter,
        orderBy: { followersCount: 'desc' },
        skip,
        take: parseInt(limit),
    });

    // Map id to _id for frontend compatibility
    const mappedArtists = artists.map(a => ({ ...a, _id: a.id }));

    res.status(StatusCodes.OK).json({
        artists: mappedArtists,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        totalArtist: count,
    });
});

//@desc - Get artist by id
//@route - GET /api/artists/:id
//@Access - Public
const getArtistsById = asyncHandler(async (req, res) => {
    const artist = await prisma.artist.findUnique({
        where: { id: req.params.id },
        include: {
            albums: {
                select: { id: true, title: true, coverImage: true, releaseDate: true }
            },
            songs: {
                take: 5,
                orderBy: { plays: 'desc' },
                select: { id: true, title: true, duration: true, plays: true, coverImage: true }
            }
        }
    });

    if (artist) {
        res.status(StatusCodes.OK).json({ ...artist, _id: artist.id });
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not Found');
    }
});

//@desc - update Artist details
//@route - PUT /api/artists/:id
//@Access - Private/Admin
const updateArtist = asyncHandler(async (req, res) => {
    const { name, bio, genres } = req.body;
    const artistId = req.params.id;

    const existingArtist = await prisma.artist.findUnique({ where: { id: artistId } });
    if (!existingArtist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not Found');
    }

    let dataToUpdate = {
        name: name || existingArtist.name,
        bio: bio || existingArtist.bio,
        genres: genres ? (Array.isArray(genres) ? genres : genres.split(',').map(g => g.trim())) : existingArtist.genres,
    };

    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/artists');
        dataToUpdate.image = result.secure_url;
    }

    const updatedArtist = await prisma.artist.update({
        where: { id: artistId },
        data: dataToUpdate,
    });

    res.status(StatusCodes.OK).json({ ...updatedArtist, _id: updatedArtist.id });
});

//@desc - Delete Artist
//@route - DELETE /api/artists/:id
//@Access - Private/Admin
const deleteArtist = asyncHandler(async (req, res) => {
    try {
        await prisma.artist.delete({
            where: { id: req.params.id }
        });
        res.status(StatusCodes.OK).json({ message: 'Artist removed' });
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not Found');
    }
});

//@desc - Get top artists
//@route - GET /api/artists/top
//@Access - Public
const getTopArtists = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const artists = await prisma.artist.findMany({
        orderBy: { followersCount: 'desc' },
        take: limit,
    });
    const mappedArtists = artists.map(a => ({ ...a, _id: a.id }));
    res.status(StatusCodes.OK).json(mappedArtists);
});

//@desc - Get Artist top songs
//@route - GET /api/artists/:id/top-songs
//@Access - Public
const getArtistTopSongs = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const songs = await prisma.song.findMany({
        where: { artistId: req.params.id },
        orderBy: { plays: 'desc' },
        take: limit,
        include: { artist: { select: { name: true } }, album: { select: { title: true } } }
    });

    if (songs.length > 0) {
        const mappedSongs = songs.map(s => ({ ...s, _id: s.id }));
        res.status(StatusCodes.OK).json(mappedSongs);
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('No songs found for this artist');
    }
});

module.exports = {
    createArtist,
    getArtists,
    getArtistsById,
    updateArtist,
    deleteArtist,
    getTopArtists,
    getArtistTopSongs,
};