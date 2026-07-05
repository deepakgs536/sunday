const express = require('express');
const orderController = require('../controllers/order.controller');
const { validate, updateStatusSchema } = require('../validators/order.validator');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.get('/:orderId', orderController.getOrder);
router.put('/:orderId/cancel', orderController.cancelOrder);
router.patch('/:orderId/status', validate(updateStatusSchema), orderController.updateStatus);

module.exports = router;
