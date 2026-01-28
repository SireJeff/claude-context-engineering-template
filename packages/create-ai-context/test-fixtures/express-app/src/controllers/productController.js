/**
 * Product Controller
 */
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Get all products
 */
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const products = await Product.find()
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments();

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Create product (admin only)
 */
exports.create = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock
    });

    logger.info(`Product created: ${product.name}`);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin only)
 */
exports.update = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    logger.info(`Product updated: ${product.name}`);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (admin only)
 */
exports.delete = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    logger.info(`Product deleted: ${product.name}`);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Search products
 */
exports.search = async (req, res, next) => {
  try {
    const { q, minPrice, maxPrice, category } = req.query;

    const query = {};

    if (q) {
      query.$text = { $search: q };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query).limit(50);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category
 */
exports.getByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    next(error);
  }
};
