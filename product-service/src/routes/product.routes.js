const express = require('express');
const productController = require('../controllers/product.controller');
const { validate, createProductSchema, updateProductSchema, uploadUrlSchema } = require('../validators/product.validator');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes (or partially protected depending on requirement, but usually read is public)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes (mocked via authMiddleware)
router.post('/', authMiddleware, validate(createProductSchema), productController.createProduct);
router.put('/:id', authMiddleware, validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

// Upload URL generation
router.post('/upload-url', authMiddleware, validate(uploadUrlSchema), productController.generateUploadUrl);

module.exports = router;
