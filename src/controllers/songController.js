const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const Song = require('../models/Song');
const  uploadToCloudinary = require('../utils/cloudinaryUpload')

//@desc - Create new Song
//@route - POST /api/songs
//@Access - Private/Admin

const createSong =  asyncHandler(async (req, res) => {
    const { title,
            artistId,
            albumId, 
            duration, 
            genre, 
            lyrics, 
            isExplicit, 
            featuredArtists } = req.body;

    // Check if artist exists
    const artist = await Artist.findById(artistId);
    if(!artist) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Artist Not Found');
    }

    // Check album exists if albumId is provided
    if(albumId) { 
        const album = await Album.findById(albumId);
        if(!album) {
            res.status(StatusCodes.NOT_FOUND);
            throw new Error('Album Not Found');
        }
    }

    // Upload audio file
    if(!req.file || !req.files.audio) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Audio is required');
    }
    const audioResult = await uploadToCloudinary(req.file.audio[0].path, 'melodify/songs');

    // Upload cover image
    let coverImageUrl = "";
    if(req.files && req.files.cover) {
        const imageResult = uploadToCloudinary(req.files.cover, 'melodify/covers');
        coverImageUrl = imageResult.secure_url;
    }

    // Create Song
    const song = await Song.create({
            title,
            artist: artistId,
            album: albumId || null, 
            duration,
            audioUrl: audioResult.secure_url,
            genre, 
            lyrics, 
            isExplicit: isExplicit === 'true', 
            featuredArtists: featuredArtist ? JSON.parse(featuredArtists) : [], 
    });

    // Add song to artist's songs
    await artist.songs.push(song_.id);
    await artist.save();

    //add song to album if albumId is provided
    if(albumId) {
        const album = await Album.findById(albumId);
        await album.songs.push(song._id);
        await album.save();
    }

    res.status(StatusCodes.CREATED).json(song); 


});
//@desc - get all songs with filtering and pagination
//@route - GET /api/songs
//@Access - Public

const getSongs =  asyncHandler(async (req, res) => {});

//@desc - get a Song by Id
//@route - GET /api/songs/:id
//@Access - Public

const getSongById =  asyncHandler(async (req, res) => {});

//@desc - update song detail
//@route - PUT /api/songs/:id
//@Access - Private/Admin

const updateSong =  asyncHandler(async (req, res) => {});

//@desc - Delete Song
//@route - DELETE /api/songs/:id
//@Access - Private/Admin

const deleteSong =  asyncHandler(async (req, res) => {});

//@desc - get top songs by plays
//@route - GET /api/songs/top?limit=5
//@Access - Public

const getTopSongs =  asyncHandler(async (req, res) => {});

//@desc - get new releases (recently added songs)
//@route - GET /api/songs/new-releases?limit=5
//@Access - Public

const getNewReleases =  asyncHandler(async (req, res) => {});

module.exports = {
    createSong,
    getSongs,
    getSongById,
    updateSong,
    deleteSong,
    getTopSongs,
    getNewReleases 
}