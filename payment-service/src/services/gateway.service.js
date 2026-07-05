const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

class MockGateway {
  async processPayment(amount, currency) {
    logger.info(`[MOCK GATEWAY] Processing payment for ${amount} ${currency}`);
    return {
      success: true,
      transactionId: `mock-txn-${crypto.randomUUID()}`
    };
  }

  async verifyPayment(transactionId) {
    logger.info(`[MOCK GATEWAY] Verifying transaction ${transactionId}`);
    return {
      success: true,
      status: 'SUCCESS' // or FAILED randomly? Requirements say simulate success locally.
    };
  }

  async refundPayment(transactionId) {
    logger.info(`[MOCK GATEWAY] Refunding transaction ${transactionId}`);
    return {
      success: true,
      refundId: `mock-ref-${crypto.randomUUID()}`
    };
  }
}

class StripeGateway {
  async processPayment(amount, currency) {
    throw new Error('Stripe implementation pending');
  }
  async verifyPayment(transactionId) {
    throw new Error('Stripe implementation pending');
  }
  async refundPayment(transactionId) {
    throw new Error('Stripe implementation pending');
  }
}

class RazorpayGateway {
  async processPayment(amount, currency) {
    throw new Error('Razorpay implementation pending');
  }
  async verifyPayment(transactionId) {
    throw new Error('Razorpay implementation pending');
  }
  async refundPayment(transactionId) {
    throw new Error('Razorpay implementation pending');
  }
}

class GatewayFactory {
  static getGateway() {
    switch (env.PAYMENT_PROVIDER) {
      case 'STRIPE':
        return new StripeGateway();
      case 'RAZORPAY':
        return new RazorpayGateway();
      case 'MOCK':
      default:
        return new MockGateway();
    }
  }
}

module.exports = GatewayFactory.getGateway();
