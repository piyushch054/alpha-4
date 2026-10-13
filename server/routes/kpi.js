const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const controller = require('../controllers/kpiController');

const { requirePermission } = require('../config/rbac');
router.use(authMiddleware);
router.get('/', requirePermission('view_ceo_oversight'), controller.getAll);
router.get('/:id', requirePermission('view_ceo_oversight'), controller.getById);
router.post('/', requirePermission('manage_ceo_oversight'), controller.create);
router.put('/:id', requirePermission('manage_ceo_oversight'), controller.update);
router.delete('/:id', requirePermission('manage_ceo_oversight'), controller.delete);

module.exports = router;
