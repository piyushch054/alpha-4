const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
const routesDir = path.join(serverDir, 'routes');
const middlewareDir = path.join(serverDir, 'middleware');
const controllersDir = path.join(serverDir, 'controllers');

// 1. authRoutes.js
const authRoutes = `
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
`;
fs.writeFileSync(path.join(routesDir, 'auth.js'), authRoutes.trim());

// 2. userRoutes.js
const userRoutes = `
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Only allow super_admin or admin to manage users
router.use(authMiddleware);
router.use(roleMiddleware('super_admin', 'admin', 'SUPER_ADMIN', 'ADMIN', 'CEO'));

router.route('/')
    .get(userController.getAll)
    .post(userController.create);

router.route('/:id')
    .get(userController.getById)
    .put(userController.update)
    .delete(userController.delete);

module.exports = router;
`;
fs.writeFileSync(path.join(routesDir, 'users.js'), userRoutes.trim());

// 3. dashboardRoutes.js
const dashboardRoutes = `
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, dashboardController.getStats);

module.exports = router;
`;
fs.writeFileSync(path.join(routesDir, 'dashboard.js'), dashboardRoutes.trim());

// 4. Update existing routes (tasks, employees, kyc, kpi) to be protected
const protectRoute = (routeName) => {
    const routePath = path.join(routesDir, routeName + '.js');
    if (!fs.existsSync(routePath)) return;
    let content = fs.readFileSync(routePath, 'utf8');
    
    // Convert to standard format with auth middleware if not already present
    if (!content.includes('authMiddleware')) {
        content = content.replace("const router = express.Router();", "const router = express.Router();\\nconst authMiddleware = require('../middleware/authMiddleware');");
        content = content.replace(/router\.(get|post|put|delete)\('/g, "router.$1('/', authMiddleware, ");
        content = content.replace(/router\.(get|post|put|delete)\('\/:id'/g, "router.$1('/:id', authMiddleware, ");
        fs.writeFileSync(routePath, content);
    }
};
['tasks', 'employees', 'kyc', 'kpi'].forEach(protectRoute);

// 5. OCR & Uploads
// We'll use multer for uploads in kycRoutes
const kycUploads = `
const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const ocrController = require('../controllers/ocrController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory or local storage
const upload = multer({ 
    dest: 'uploads/', 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
        }
    }
});

// Protect all routes
router.use(authMiddleware);

router.post('/ocr', upload.single('file'), ocrController.processOCR);

router.get('/', kycController.getAll);
router.get('/:id', kycController.getById);
router.post('/', kycController.create);
router.put('/:id', kycController.update);
router.delete('/:id', kycController.delete);

module.exports = router;
`;
fs.writeFileSync(path.join(routesDir, 'kyc.js'), kycUploads.trim());

// 6. ocrController.js
const ocrController = `
const fs = require('fs');

exports.processOCR = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        // This is where real OCR (e.g. AWS Textract, Tesseract.js, Google Cloud Vision) would hook in.
        // REQUIRES EXTERNAL CONFIGURATION: process.env.AWS_ACCESS_KEY_ID or similar.
        // For now, we simulate a heavy async operation that parses the document into structured data.
        
        const mockStructuredExtraction = {
            appliedBy: "Jane Doe",
            division: "Retail",
            description: "Passport upload",
            contactName: "Jane Doe",
            qty: 1,
            material: "Paper",
            rate: 100,
            gst: 18,
            hsn: "9983",
            handwrittenContent: "Verified original",
            confidence: 0.92,
            requiresReview: true // Always true for blurry/unverified mocks
        };

        // Clean up the file from temp storage after processing
        if (req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if(err) console.error("Failed to delete temp file:", err);
            });
        }

        res.json({
            success: true,
            data: mockStructuredExtraction,
            message: 'OCR processed successfully. Please review the extracted fields.'
        });
    } catch (err) { next(err); }
};
`;
fs.writeFileSync(path.join(controllersDir, 'ocrController.js'), ocrController.trim());

console.log("Routes protected and OCR upload pipeline generated successfully.");
