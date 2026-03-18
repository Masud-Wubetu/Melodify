const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
});

// File filter - only allow audio and image files
const fileFilter = (req, file, cb) => {
    // Accept audio files(mp3, wav, mpeg)
    const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Only audio or image files are allowed.'));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Increased to 20MB for audio
    fileFilter,
});

const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: "auto", // Automatically detect if it's image or video/audio
        });
        return result;
    } catch (error) {
        throw new Error(`Cloudinary Upload Error: ${error.message}`);
    }
};

module.exports = {
    upload,
    uploadToCloudinary
};
