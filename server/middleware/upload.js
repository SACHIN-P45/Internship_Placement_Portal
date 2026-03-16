// Multer configuration for PDF resume uploads
const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (_req, _file, cb) {
    // ✅ FIX: Always force a .pdf extension regardless of originalname
    // to prevent serving files with dangerous extensions (e.g. .exe disguised as PDF)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}.pdf`);
  },
});

// File filter — double-check BOTH mimetype AND extension to prevent spoofed uploads
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimePdf = file.mimetype === 'application/pdf';
  const isExtPdf = ext === '.pdf';

  if (isMimePdf && isExtPdf) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed. Please upload a valid .pdf document.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

module.exports = upload;
