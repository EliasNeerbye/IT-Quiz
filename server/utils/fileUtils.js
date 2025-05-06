const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || 'http://localhost:5000/uploads';


exports.handleImageUpload = async (file, prefix = '') => {
    if (!file) return null;
    
    
    if (!file.mimetype.startsWith('image/')) {
        throw new Error('File must be an image');
    }
    
    const fileExt = path.extname(file.name);
    const fileName = `${prefix}${uuidv4()}${fileExt}`;
    const uploadDir = path.join(__dirname, '../uploads');
    const uploadPath = path.join(uploadDir, fileName);
    
    
    fs.mkdirSync(uploadDir, { recursive: true });
    
    
    await file.mv(uploadPath);
    
    
    return `${UPLOAD_BASE_URL}/${fileName}`;
};


exports.deleteFile = (filePath) => {
    if (!filePath) return;
    
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};