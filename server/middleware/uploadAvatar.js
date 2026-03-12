// Multer configuration for profile avatar image uploads
const multer = require('multer');

// Use memory storage — we'll convert to base64 and store in MongoDB
const storage = multer.memoryStorage();

// File filter — accept images only
const fileFilter = (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed'), false);
    }
};

const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
});

module.exports = uploadAvatar;
