const inventoryService = require('../services/inventory.service');
const { success } = require('../utils/response');

class InventoryController {
  async createInventory(req, res, next) {
    try {
      const { productId } = req.body;
      const data = await inventoryService.createInventory(productId);
      return success(res, 201, 'Inventory created successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getInventory(req, res, next) {
    try {
      const { productId } = req.params;
      const data = await inventoryService.getInventory(productId);
      return success(res, 200, 'Inventory retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getAllInventory(req, res, next) {
    try {
      const { limit, lastEvaluatedKey } = req.query;
      const params = {
        limit: limit ? parseInt(limit, 10) : 10,
        lastEvaluatedKey
      };
      const result = await inventoryService.getAllInventory(params);
      
      return success(res, 200, 'Inventories retrieved successfully', result.items, {
        nextKey: result.nextKey
      });
    } catch (error) {
      next(error);
    }
  }

  async addStock(req, res, next) {
    try {
      const { productId } = req.params;
      const { amount } = req.body;
      const data = await inventoryService.addStock(productId, amount);
      return success(res, 200, 'Stock added successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async removeStock(req, res, next) {
    try {
      const { productId } = req.params;
      const { amount } = req.body;
      const data = await inventoryService.removeStock(productId, amount);
      return success(res, 200, 'Stock removed successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async reserveStock(req, res, next) {
    try {
      const { productId } = req.params;
      const { amount } = req.body;
      const data = await inventoryService.reserveStock(productId, amount);
      return success(res, 200, 'Stock reserved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async releaseStock(req, res, next) {
    try {
      const { productId } = req.params;
      const { amount } = req.body;
      const data = await inventoryService.releaseStock(productId, amount);
      return success(res, 200, 'Stock released successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async deleteInventory(req, res, next) {
    try {
      const { productId } = req.params;
      await inventoryService.deleteInventory(productId);
      return success(res, 200, 'Inventory deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
