const cloudinary = require('../config/cloudinary');
const fs = require('fs');
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
            await fs.unlink(filePath);
        }
    }

}

module.exports = uploadToCloudinary;