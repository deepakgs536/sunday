const express = require('express');
const cartController = require('../controllers/cart.controller');
const { validate, addItemSchema, updateQuantitySchema } = require('../validators/cart.validator');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', cartController.getCart);
router.delete('/', cartController.clearCart);

router.post('/items', validate(addItemSchema), cartController.addItem);
router.put('/items/:productId', validate(updateQuantitySchema), cartController.updateQuantity);
router.delete('/items/:productId', cartController.removeItem);

module.exports = router;
