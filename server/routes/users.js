const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require('../config/rbac');

// Only allow super_admin or admin to manage users
router.use(authMiddleware);
router.use(requirePermission('manage_users'));

router.route('/')
    .get(userController.getAll)
    .post(userController.create);

router.route('/:id')
    .get(userController.getById)
    .put(userController.update)
    .delete(userController.delete);

module.exports = router;