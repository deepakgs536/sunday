const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { validate, createPaymentSchema } = require('../validators/payment.validator');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Webhooks don't use standard JWT auth, they rely on signature verification
router.post('/webhook', paymentController.webhook);

// Apply auth middleware to remaining routes
router.use(authMiddleware);

router.post('/', validate(createPaymentSchema), paymentController.createPayment);
router.get('/:paymentId', paymentController.getPayment);
router.post('/verify', paymentController.verifyPayment);
router.post('/refund', paymentController.refundPayment);

module.exports = router;
