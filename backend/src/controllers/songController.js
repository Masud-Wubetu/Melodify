const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const prisma = require('../lib/prisma');
const { uploadToCloudinary } = require('../middlewares/upload');

//@desc - create Song
//@route - POST /api/songs
//@Access - Private/Admin
const createSong = asyncHandler(async (req, res) => {
    const { title, artistId, albumId, duration, genre, isExplicit, releaseDate } = req.body;

    if (!title || !artistId || !duration) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please include all required fields (title, artist, duration)');
    }

    let audioUrl = '';
    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/songs', 'auto');
        audioUrl = result.secure_url;
    } else {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Audio file is required');
    }

    const song = await prisma.song.create({
        data: {
            title,
            artistId,
            albumId: albumId || null,
            duration,
            genre,
            audioUrl,
            isExplicit: isExplicit === 'true' || isExplicit === true,
            releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        },
        include: {
            artist: { select: { name: true } },
            album: { select: { title: true, coverImage: true } }
        }
    });

    res.status(StatusCodes.CREATED).json({ ...song, _id: song.id });
});

//@desc - Get all songs with pagination
//@route - GET /api/songs
//@Access - Public
const getSongs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '', genre } = req.query;

    const filter = {
        AND: [
            search ? { title: { contains: search, mode: 'insensitive' } } : {},
            genre ? { genre: { contains: genre, mode: 'insensitive' } } : {},
        ]
    };

    const count = await prisma.song.count({ where: filter });
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const songs = await prisma.song.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
            artist: { select: { name: true, image: true } },
            album: { select: { title: true, coverImage: true } }
        }
    });

    const mappedSongs = songs.map(s => ({ ...s, _id: s.id }));

    res.status(StatusCodes.OK).json({
        songs: mappedSongs,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        totalSong: count,
    });
});

//@desc - get a Song by Id
//@route - GET /api/songs/:id
//@Access - Public
const getSongById = asyncHandler(async (req, res) => {
    const song = await prisma.song.findUnique({
        where: { id: req.params.id },
        include: {
            artist: { select: { id: true, name: true, image: true } },
            album: { select: { id: true, title: true, coverImage: true } },
            featuredArtists: { select: { id: true, name: true } }
        }
    });

    if (song) {
        res.status(StatusCodes.OK).json({ ...song, _id: song.id });
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Song Not Found');
    }
});

//@desc - update Song
//@route - PUT /api/songs/:id
//@Access - Private/Admin
const updateSong = asyncHandler(async (req, res) => {
    const { title, duration, genre, isExplicit, releaseDate, albumId } = req.body;
    const songId = req.params.id;

    const existingSong = await prisma.song.findUnique({ where: { id: songId } });
    if (!existingSong) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Song Not Found');
    }

    let dataToUpdate = {
        title: title || existingSong.title,
        duration: duration || existingSong.duration,
        genre: genre || existingSong.genre,
        isExplicit: isExplicit !== undefined ? (isExplicit === 'true' || isExplicit === true) : existingSong.isExplicit,
        releaseDate: releaseDate ? new Date(releaseDate) : existingSong.releaseDate,
        albumId: albumId !== undefined ? (albumId || null) : existingSong.albumId,
    };

    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/songs', 'auto');
        dataToUpdate.audioUrl = result.secure_url;
    }

    const updatedSong = await prisma.song.update({
        where: { id: songId },
        data: dataToUpdate,
        include: {
            artist: { select: { name: true } },
            album: { select: { title: true } }
        }
    });

    res.status(StatusCodes.OK).json({ ...updatedSong, _id: updatedSong.id });
});

//@desc - Delete Song
//@route - DELETE /api/songs/:id
//@Access - Private/Admin
const deleteSong = asyncHandler(async (req, res) => {
    try {
        await prisma.song.delete({
            where: { id: req.params.id }
        });
        res.status(StatusCodes.OK).json({ message: 'Song removed' });
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Song Not Found');
    }
});

//@desc - get top songs (most played)
//@route - GET /api/songs/top
//@Access - Public
const getTopSongs = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const songs = await prisma.song.findMany({
        orderBy: { plays: 'desc' },
        take: limit,
        include: {
            artist: { select: { name: true, image: true } },
            album: { select: { title: true, coverImage: true } }
        }
    });

    const mappedSongs = songs.map(s => ({ ...s, _id: s.id }));
    res.status(StatusCodes.OK).json(mappedSongs);
});

//@desc - get new releases (recently added songs)
//@route - GET /api/songs/new-releases
//@Access - Public
const getNewReleases = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const songs = await prisma.song.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            artist: { select: { name: true, image: true } },
            album: { select: { title: true, coverImage: true } }
        }
    });

    const mappedSongs = songs.map(s => ({ ...s, _id: s.id }));
    res.status(StatusCodes.OK).json(mappedSongs);
});

module.exports = {
    createSong,
    getSongs,
    getSongById,
    updateSong,
    deleteSong,
    getTopSongs,
    getNewReleases,
};