const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const prisma = require('../lib/prisma');
const { uploadToCloudinary } = require('../middlewares/upload');

//@desc - create Playlist
//@route - POST /api/playlists
//@Access - Private
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPublic } = req.body;

    if (!name) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Playlist name is required');
    }

    let imageUrl = 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg';
    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, "melodify/playlists");
        imageUrl = result.secure_url;
    }

    const playlist = await prisma.playlist.create({
        data: {
            name,
            description,
            isPublic: isPublic === 'true' || isPublic === true,
            coverImage: imageUrl,
            creatorId: req.user.id,
        },
        include: {
            creator: { select: { name: true } }
        }
    });

    res.status(StatusCodes.CREATED).json({ ...playlist, _id: playlist.id });
});

//@desc - Get all public playlists
//@route - GET /api/playlists
//@Access - Public
const getPlaylists = asyncHandler(async (req, res) => {
    const playlists = await prisma.playlist.findMany({
        where: { isPublic: true },
        include: {
            creator: { select: { name: true, profilePicture: true } }
        }
    });

    // Map id to _id for frontend compatibility
    const mappedPlaylists = playlists.map(p => ({ ...p, _id: p.id }));
    res.status(StatusCodes.OK).json(mappedPlaylists);
});

//@desc - get User Playlists
//@route - GET /api/playlists/me
//@Access - Private
const getUserPlaylists = asyncHandler(async (req, res) => {
    const playlists = await prisma.playlist.findMany({
        where: {
            OR: [
                { creatorId: req.user.id },
                { collaborators: { some: { id: req.user.id } } }
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
            creator: { select: { name: true, profilePicture: true } }
        }
    });

    const mappedPlaylists = playlists.map(p => ({ ...p, _id: p.id }));
    res.status(StatusCodes.OK).json(mappedPlaylists);
});

//@desc - Get playlist by Id
//@route - GET /api/playlists/:id
//@Access - Public
const getPlaylistById = asyncHandler(async (req, res) => {
    const playlist = await prisma.playlist.findUnique({
        where: { id: req.params.id },
        include: {
            creator: { select: { id: true, name: true, profilePicture: true } },
            songs: {
                include: {
                    artist: { select: { name: true } },
                    album: { select: { title: true } }
                }
            },
            collaborators: { select: { id: true, name: true, profilePicture: true } }
        }
    });

    if (playlist) {
        res.status(StatusCodes.OK).json({ ...playlist, _id: playlist.id });
    } else {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Playlist Not Found');
    }
});

//@desc - update Playlist
//@route - PUT /api/playlists/:id
//@Access - Private
const updatePlaylist = asyncHandler(async (req, res) => {
    const { name, description, isPublic } = req.body;
    const playlistId = req.params.id;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Playlist Not Found');
    }

    if (playlist.creatorId !== req.user.id) {
        res.status(StatusCodes.FORBIDDEN);
        throw new Error('Not authorized to update this playlist');
    }

    let dataToUpdate = {
        name: name || playlist.name,
        description: description || playlist.description,
        isPublic: isPublic !== undefined ? (isPublic === 'true' || isPublic === true) : playlist.isPublic,
    };

    if (req.file) {
        const result = await uploadToCloudinary(req.file.path, "melodify/playlists");
        dataToUpdate.coverImage = result.secure_url;
    }

    const updatedPlaylist = await prisma.playlist.update({
        where: { id: playlistId },
        data: dataToUpdate,
    });

    res.status(StatusCodes.OK).json({ ...updatedPlaylist, _id: updatedPlaylist.id });
});

//@desc - delete Playlist
//@route - DELETE /api/playlists/:id
//@Access - Private
const deletePlaylist = asyncHandler(async (req, res) => {
    const playlist = await prisma.playlist.findUnique({ where: { id: req.params.id } });

    if (!playlist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Playlist Not Found');
    }

    if (playlist.creatorId !== req.user.id) {
        res.status(StatusCodes.FORBIDDEN);
        throw new Error('Not authorized to delete this playlist');
    }

    await prisma.playlist.delete({
        where: { id: req.params.id }
    });

    res.status(StatusCodes.OK).json({ message: 'Playlist removed' });
});

//@desc - Add song to playlist
//@route - POST /api/playlists/:id/songs
//@Access - Private
const addSongToPlaylist = asyncHandler(async (req, res) => {
    const { songId } = req.body;
    const playlistId = req.params.id;

    const playlist = await prisma.playlist.findUnique({
        where: { id: playlistId },
        include: { collaborators: { select: { id: true } } }
    });

    if (!playlist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Playlist Not Found');
    }

    const isCollaborator = playlist.collaborators.some(c => c.id === req.user.id);
    if (playlist.creatorId !== req.user.id && !isCollaborator) {
        res.status(StatusCodes.FORBIDDEN);
        throw new Error('Not authorized to add songs to this playlist');
    }

    await prisma.playlist.update({
        where: { id: playlistId },
        data: {
            songs: { connect: { id: songId } }
        }
    });

    res.status(StatusCodes.OK).json({ message: 'Song added to playlist' });
});

//@desc - remove song from Playlist
//@route - DELETE /api/playlists/:id/songs/:songId
//@Access - Private
const removeSongFromPlaylist = asyncHandler(async (req, res) => {
    const { id: playlistId, songId } = req.params;

    const playlist = await prisma.playlist.findUnique({
        where: { id: playlistId },
        include: { collaborators: { select: { id: true } } }
    });

    if (!playlist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Playlist Not Found');
    }

    const isCollaborator = playlist.collaborators.some(c => c.id === req.user.id);
    if (playlist.creatorId !== req.user.id && !isCollaborator) {
        res.status(StatusCodes.FORBIDDEN);
        throw new Error('Not authorized to remove songs from this playlist');
    }

    await prisma.playlist.update({
        where: { id: playlistId },
        data: {
            songs: { disconnect: { id: songId } }
        }
    });

    res.status(StatusCodes.OK).json({ message: 'Song removed from playlist' });
});

//@desc - add collaborator to playlist
//@route - PUT /api/playlists/:id/add-collaborator
//@Access - Private
const addCollaboratorToPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const playlistId = req.params.id;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Playlist Not Found');
    }

    if (playlist.creatorId !== req.user.id) {
        res.status(StatusCodes.FORBIDDEN);
        throw new Error('Only the creator can add collaborators');
    }

    await prisma.playlist.update({
        where: { id: playlistId },
        data: {
            collaborators: { connect: { id: userId } }
        }
    });

    res.status(StatusCodes.OK).json({ message: 'Collaborator added' });
});

//@desc - remove collaborator from playlist
//@route - PUT /api/playlists/:id/remove-collaborator
//@Access - Private
const removeCollaboratorToPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const playlistId = req.params.id;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Playlist Not Found');
    }

    if (playlist.creatorId !== req.user.id) {
        res.status(StatusCodes.FORBIDDEN);
        throw new Error('Only the creator can remove collaborators');
    }

    await prisma.playlist.update({
        where: { id: playlistId },
        data: {
            collaborators: { disconnect: { id: userId } }
        }
    });

    res.status(StatusCodes.OK).json({ message: 'Collaborator removed' });
});

//@desc - get featured playlists
//@route - GET /api/playlists/featured
//@Access - Public
const getFeaturedPlaylists = asyncHandler(async (req, res) => {
    const playlists = await prisma.playlist.findMany({
        where: { isPublic: true },
        take: 10,
        orderBy: { followersCount: 'desc' },
        include: { creator: { select: { name: true } } }
    });

    const mappedPlaylists = playlists.map(p => ({ ...p, _id: p.id }));
    res.status(StatusCodes.OK).json(mappedPlaylists);
});

module.exports = {
    createPlaylist,
    getPlaylists,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    addCollaboratorToPlaylist,
    removeCollaboratorToPlaylist,
    getFeaturedPlaylists,
};