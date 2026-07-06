const env = require('../config/env');
const logger = require('../utils/logger');

class ProductClient {
  async getProduct(productId) {
    if (!env.PRODUCT_SERVICE_URL) {
      logger.debug('PRODUCT_SERVICE_URL not set. Mocking product check as valid.');
      return { productId, name: 'Mock Product', isActive: true, isDeleted: false };
    }

    try {
      const response = await fetch(`${env.PRODUCT_SERVICE_URL}/api/v1/products/${productId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Product check failed with status: ${response.status}`);
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      logger.error('Failed to get product details', { error: error.message, productId });
      throw new Error('Service Unavailable: Could not verify product');
    }
  }
}

module.exports = new ProductClient();
