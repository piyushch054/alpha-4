const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const ocrController = require('../controllers/ocrController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ 
    dest: 'uploads/', 
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
        }
    }
});

router.use(authMiddleware);

router.post('/ocr', upload.single('file'), ocrController.processOCR);

router.get('/', kycController.getAll);
router.get('/:id', kycController.getById);
router.post('/', kycController.create);
router.put('/:id', kycController.update);
router.delete('/:id', kycController.delete);

module.exports = router;
