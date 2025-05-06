const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Handle file upload for images
 * @param {Object} file - The file object from express-fileupload
 * @param {string} prefix - Optional prefix for the filename
 * @returns {string|null} - The path to the saved file or null if failed
 */
exports.handleImageUpload = async (file, prefix = '') => {
    if (!file) return null;
    
    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
        throw new Error('File must be an image');
    }
    
    const fileExt = path.extname(file.name);
    const fileName = `${prefix}${uuidv4()}${fileExt}`;
    const uploadDir = path.join(__dirname, '../uploads');
    const uploadPath = path.join(uploadDir, fileName);
    
    // Ensure upload directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    
    // Save the file
    await file.mv(uploadPath);
    
    return `/uploads/${fileName}`;
};

/**
 * Delete a file
 * @param {string} filePath - Path to the file, relative to the server root
 */
exports.deleteFile = (filePath) => {
    if (!filePath) return;
    
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};