const env = require('../config/env');
const logger = require('../utils/logger');

class InventoryClient {
  async checkStock(productId, requiredQuantity) {
    if (!env.INVENTORY_SERVICE_URL) {
      logger.debug('INVENTORY_SERVICE_URL not set. Mocking stock check as available.');
      return { isAvailable: true };
    }

    try {
      const response = await fetch(`${env.INVENTORY_SERVICE_URL}/v1/api/inventory/${productId}`);
      if (!response.ok) {
        if (response.status === 404) return { isAvailable: false };
        throw new Error(`Inventory check failed with status: ${response.status}`);
      }

      const { data } = await response.json();
      return {
        isAvailable: data.available >= requiredQuantity,
        available: data.available
      };
    } catch (error) {
      logger.error('Failed to check stock', { error: error.message, productId });
      // Depending on business rules, we might fail open or closed. Failing closed is safer.
      throw new Error('Service Unavailable: Could not verify inventory');
    }
  }
}

module.exports = new InventoryClient();
