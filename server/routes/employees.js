const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const controller = require('../controllers/employeeController');

const { requirePermission } = require('../config/rbac');
router.use(authMiddleware);
router.get('/', requirePermission('view_hr'), controller.getAll);
router.get('/:id', requirePermission('view_hr'), controller.getById);
router.post('/', requirePermission('manage_hr'), controller.create);
router.put('/:id', requirePermission('manage_hr'), controller.update);
router.delete('/:id', requirePermission('manage_hr'), controller.delete);

module.exports = router;
