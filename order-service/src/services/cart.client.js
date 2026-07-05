const env = require('../config/env');
const logger = require('../utils/logger');

class CartClient {
  async getCart(userId, token) {
    if (!env.CART_SERVICE_URL) {
      logger.debug('CART_SERVICE_URL not set. Mocking cart details.');
      return {
        cartId: 'mock-cart-123',
        userId,
        items: [
          { productId: 'prod-1', quantity: 2, price: 50 },
          { productId: 'prod-2', quantity: 1, price: 100 }
        ]
      };
    }

    try {
      const response = await fetch(`${env.CART_SERVICE_URL}/api/v1/cart`, {
        headers: { Authorization: token }
      });
      if (!response.ok) {
        throw new Error(`Cart service returned ${response.status}`);
      }
      const { data } = await response.json();
      return data;
    } catch (error) {
      logger.error('Failed to get cart', { error: error.message, userId });
      throw new Error('Service Unavailable: Could not fetch cart');
    }
  }

  async clearCart(userId, token) {
    if (!env.CART_SERVICE_URL) {
      logger.debug('CART_SERVICE_URL not set. Mocking clear cart.');
      return;
    }

    try {
      await fetch(`${env.CART_SERVICE_URL}/api/v1/cart`, {
        method: 'DELETE',
        headers: { Authorization: token }
      });
    } catch (error) {
      logger.error('Failed to clear cart', { error: error.message, userId });
    }
  }
}

module.exports = new CartClient();
