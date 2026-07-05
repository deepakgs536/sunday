const env = require('../config/env');
const logger = require('../utils/logger');

class OrderClient {
  async getOrder(orderId, token) {
    if (!env.ORDER_SERVICE_URL) {
      logger.debug('ORDER_SERVICE_URL not set. Mocking order details.');
      return {
        orderId,
        userId: 'mock-user-123',
        totalAmount: 500,
        status: 'PENDING'
      };
    }

    try {
      const response = await fetch(`${env.ORDER_SERVICE_URL}/api/v1/orders/${orderId}`, {
        headers: { Authorization: token }
      });
      if (!response.ok) {
        throw new Error(`Order service returned ${response.status}`);
      }
      const { data } = await response.json();
      return data;
    } catch (error) {
      logger.error('Failed to get order', { error: error.message, orderId });
      throw new Error('Service Unavailable: Could not fetch order details');
    }
  }
}

module.exports = new OrderClient();
