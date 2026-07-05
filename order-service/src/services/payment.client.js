const env = require('../config/env');
const logger = require('../utils/logger');

class PaymentClient {
  async processPayment(orderId, amount) {
    if (!env.PAYMENT_SERVICE_URL) {
      logger.debug('PAYMENT_SERVICE_URL not set. Mocking payment processing.');
      return { success: true };
    }

    try {
      // Mock integration
      return { success: true };
    } catch (error) {
      logger.error('Failed to process payment', { error: error.message, orderId });
      throw new Error('Service Unavailable: Could not process payment');
    }
  }
}

module.exports = new PaymentClient();
