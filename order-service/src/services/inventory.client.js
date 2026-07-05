const env = require('../config/env');
const logger = require('../utils/logger');

class InventoryClient {
  async reserveStock(orderId, items) {
    if (!env.INVENTORY_SERVICE_URL) {
      logger.debug('INVENTORY_SERVICE_URL not set. Mocking stock reservation as successful.');
      return { success: true };
    }

    try {
      // In a real implementation this would iterate over items or send a batch request
      // We will mock successful response assuming the mock server responds 200
      return { success: true };
    } catch (error) {
      logger.error('Failed to reserve stock', { error: error.message, orderId });
      throw new Error('Service Unavailable: Could not reserve inventory');
    }
  }
}

module.exports = new InventoryClient();
