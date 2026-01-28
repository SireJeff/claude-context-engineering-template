/**
 * User Routes
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users - List all users (admin only)
router.get('/', authenticate, authorize('admin'), userController.getAll);

// GET /api/users/me - Get current user profile
router.get('/me', authenticate, userController.getProfile);

// PUT /api/users/me - Update current user profile
router.put('/me', authenticate, userController.updateProfile);

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticate, userController.getById);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', authenticate, authorize('admin'), userController.update);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticate, authorize('admin'), userController.delete);

module.exports = router;
