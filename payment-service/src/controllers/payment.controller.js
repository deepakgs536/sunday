const paymentService = require('../services/payment.service');
const { success } = require('../utils/response');

class PaymentController {
  async createPayment(req, res, next) {
    try {
      const { userId } = req.user;
      const { orderId, amount, currency, paymentMethod } = req.body;
      const data = await paymentService.createPayment(orderId, userId, amount, currency, paymentMethod);
      return success(res, 201, 'Payment initiated', data);
    } catch (error) {
      next(error);
    }
  }

  async getPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const data = await paymentService.getPayment(paymentId);
      return success(res, 200, 'Payment retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const { paymentId } = req.body;
      const data = await paymentService.verifyPayment(paymentId);
      return success(res, 200, 'Payment verified', data);
    } catch (error) {
      next(error);
    }
  }

  async refundPayment(req, res, next) {
    try {
      const { paymentId } = req.body;
      const data = await paymentService.refundPayment(paymentId);
      return success(res, 200, 'Payment refunded', data);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req, res, next) {
    try {
      // Signature is usually in headers, e.g. Stripe-Signature
      const signature = req.headers['stripe-signature'] || req.headers['x-razorpay-signature'];
      const data = await paymentService.handleWebhook(req.body, signature);
      return success(res, 200, 'Webhook processed', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
