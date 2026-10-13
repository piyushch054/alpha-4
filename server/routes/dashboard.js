const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const { requirePermission } = require('./../config/rbac');
router.get('/stats', authMiddleware, requirePermission('view_ceo_oversight'), dashboardController.getStats);

module.exports = router;