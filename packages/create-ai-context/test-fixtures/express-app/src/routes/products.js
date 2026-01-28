/**
 * Product Routes
 */
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/products - List all products
router.get('/', productController.getAll);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getById);

// POST /api/products - Create product (admin only)
router.post('/', authenticate, authorize('admin'), productController.create);

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticate, authorize('admin'), productController.update);

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticate, authorize('admin'), productController.delete);

// GET /api/products/search - Search products
router.get('/search', productController.search);

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', productController.getByCategory);

module.exports = router;
