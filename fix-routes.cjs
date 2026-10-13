const fs = require('fs');

['tasks', 'employees', 'kpi'].forEach(r => {
    fs.writeFileSync('server/routes/' + r + '.js', `
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const controller = require('../controllers/${r}Controller');

router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

module.exports = router;
`.trim() + '\n');
});

// KYC is special because it has OCR uploads
fs.writeFileSync('server/routes/kyc.js', `
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
`.trim() + '\n');

console.log("Fixed route files.");
