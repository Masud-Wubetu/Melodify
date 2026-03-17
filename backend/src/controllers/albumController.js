const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const prisma = require('../lib/prisma');
const { uploadToCloudinary } = require('../middlewares/upload');

//@desc - create Album
//@route - POST /api/albums
//@Access - Private/Admin
const createAlbum = asyncHandler(async (req, res) => {
    const { title, artistId, releaseDate, genre, description, isExplicit } = req.body;

    if (!title || !artistId) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Album title and Artist are required');
    }

    // Check if artist exists
    const artist = await prisma.artist.findUnique({ where: { id: artistId } });
    if (!artist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not Found');
    }

    let imageUrl = 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg';
    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/albums');
        imageUrl = result.secure_url;
    }

    const album = await prisma.album.create({
        data: {
            title,
            artistId,
            genre,
            description,
            isExplicit: isExplicit === 'true' || isExplicit === true,
            coverImage: imageUrl,
            releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        },
        include: { artist: { select: { name: true } } }
    });

    res.status(StatusCodes.CREATED).json({ ...album, _id: album.id });
});

//@desc - Get all albums
//@route - GET /api/albums
//@Access - Public
const getAlbums = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = '', genre } = req.query;

    const filter = {
        AND: [
            search ? { title: { contains: search, mode: 'insensitive' } } : {},
            genre ? { genre: { contains: genre, mode: 'insensitive' } } : {},
        ]
    };

    const count = await prisma.album.count({ where: filter });
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const albums = await prisma.album.findMany({
        where: filter,
        orderBy: { releaseDate: 'desc' },
        skip,
        take: parseInt(limit),
        include: { artist: { select: { name: true, image: true } } }
    });

    const mappedAlbums = albums.map(a => ({ ...a, _id: a.id }));

    res.status(StatusCodes.OK).json({
        albums: mappedAlbums,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        totalAlbum: count,
    });
});

//@desc - Get album by id
//@route - GET /api/albums/:id
//@Access - Public
const getAlbumById = asyncHandler(async (req, res) => {
    const album = await prisma.album.findUnique({
        where: { id: req.params.id },
        include: {
            artist: { select: { id: true, name: true, image: true, bio: true } },
            songs: {
                orderBy: { releaseDate: 'asc' },
                include: { artist: { select: { name: true } } }
            }
        }
    });

    if (album) {
        res.status(StatusCodes.OK).json({ ...album, _id: album.id });
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Album Not Found');
    }
});

//@desc - update Album
//@route - PUT /api/albums/:id
//@Access - Private/Admin
const updateAlbum = asyncHandler(async (req, res) => {
    const { title, genre, description, isExplicit, releaseDate } = req.body;
    const albumId = req.params.id;

    const existingAlbum = await prisma.album.findUnique({ where: { id: albumId } });
    if (!existingAlbum) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Album Not Found');
    }

    let dataToUpdate = {
        title: title || existingAlbum.title,
        genre: genre || existingAlbum.genre,
        description: description || existingAlbum.description,
        isExplicit: isExplicit !== undefined ? (isExplicit === 'true' || isExplicit === true) : existingAlbum.isExplicit,
        releaseDate: releaseDate ? new Date(releaseDate) : existingAlbum.releaseDate,
    };

    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, 'melodify/albums');
        dataToUpdate.coverImage = result.secure_url;
    }

    const updatedAlbum = await prisma.album.update({
        where: { id: albumId },
        data: dataToUpdate,
        include: { artist: { select: { name: true } } }
    });

    res.status(StatusCodes.OK).json({ ...updatedAlbum, _id: updatedAlbum.id });
});

//@desc - Delete Album
//@route - DELETE /api/albums/:id
//@Access - Private/Admin
const deleteAlbum = asyncHandler(async (req, res) => {
    try {
        await prisma.album.delete({
            where: { id: req.params.id }
        });
        res.status(StatusCodes.OK).json({ message: 'Album removed' });
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Album Not Found');
    }
});

//@desc - delete Song from album
//@route - DELETE /api/albums/:id/songs/:songId
//@Access - Private/Admin
const removeSongFromAlbum = asyncHandler(async (req, res) => {
    const { id, songId } = req.params;

    try {
        await prisma.song.update({
            where: { id: songId },
            data: { albumId: null }
        });

        res.status(StatusCodes.OK).json({ message: 'Song removed from album' });
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Album or Song Not Found');
    }
});

//@desc - add Songs to album
//@route - PUT /api/albums/:id/add-songs
//@Access - Private/Admin
const addSongsToAlbum = asyncHandler(async (req, res) => {
    const { songIds } = req.body;
    const albumId = req.params.id;

    if (!songIds || !Array.isArray(songIds)) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Please provide an array of song IDs');
    }

    try {
        await prisma.album.update({
            where: { id: albumId },
            data: {
                songs: {
                    connect: songIds.map(id => ({ id }))
                }
            }
        });

        res.status(StatusCodes.OK).json({ message: 'Songs added to album' });
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Album or Song Not Found');
    }
});

//@desc - get new releases
//@route - GET /api/albums/new-releases
//@Access - Public
const getNewReleases = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const albums = await prisma.album.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { artist: { select: { name: true, image: true } } }
    });

    const mappedAlbums = albums.map(a => ({ ...a, _id: a.id }));
    res.status(StatusCodes.OK).json(mappedAlbums);
});

module.exports = {
    createAlbum,
    getAlbums,
    getAlbumById,
    updateAlbum,
    deleteAlbum,
    addSongsToAlbum,
    removeSongFromAlbum,
    getNewReleases,
};