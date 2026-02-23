const cloudinary = require('../config/cloudinary');
const fs = require('fs/promises');
const fsSync = require('fs');

const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'auto',
        });

        return result;
    } catch (error) {
        throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    } finally {
        if (fsSync.existsSync(filePath)) {
            try {
                await fs.unlink(filePath);
            } catch (err) {
                 console.error('Failed to delete file:', err.message);
            }
        }
    }

}

module.exports = uploadToCloudinary;