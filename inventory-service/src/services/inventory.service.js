const crypto = require('crypto');
const inventoryRepository = require('../repositories/inventory.repository');
const eventService = require('./event.service');

const attachAvailable = (item) => {
  if (!item) return item;
  return {
    ...item,
    available: item.quantity - item.reservedQuantity
  };
};

class InventoryService {
  async createInventory(productId) {
    const existing = await inventoryRepository.findByProductId(productId);
    if (existing && !existing.isDeleted) {
      const error = new Error('Inventory for this product already exists');
      error.statusCode = 400;
      throw error;
    }

    const newInventory = {
      inventoryId: crypto.randomUUID(),
      productId,
      quantity: 0,
      reservedQuantity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };

    await inventoryRepository.create(newInventory);
    
    await eventService.publish('InventoryCreated', {
      inventoryId: newInventory.inventoryId,
      productId: newInventory.productId,
      quantity: newInventory.quantity,
      reservedQuantity: newInventory.reservedQuantity
    });

    return attachAvailable(newInventory);
  }

  async getInventory(productId) {
    const inventory = await inventoryRepository.findByProductId(productId);
    if (!inventory || inventory.isDeleted) {
      const error = new Error('Inventory not found');
      error.statusCode = 404;
      throw error;
    }
    return attachAvailable(inventory);
  }

  async getAllInventory(params) {
    const result = await inventoryRepository.findAll(params);
    result.items = result.items.map(attachAvailable);
    return result;
  }

  async addStock(productId, amount) {
    const inventory = await inventoryRepository.findByProductId(productId);
    if (!inventory || inventory.isDeleted) {
      const error = new Error('Inventory not found');
      error.statusCode = 404;
      throw error;
    }

    const newQuantity = inventory.quantity + amount;
    const updated = await inventoryRepository.update(productId, { quantity: newQuantity });
    
    await eventService.publish('StockAdded', {
      inventoryId: updated.inventoryId,
      productId,
      quantity: updated.quantity,
      reservedQuantity: updated.reservedQuantity
    });

    return attachAvailable(updated);
  }

  async removeStock(productId, amount) {
    const inventory = await inventoryRepository.findByProductId(productId);
    if (!inventory || inventory.isDeleted) {
      const error = new Error('Inventory not found');
      error.statusCode = 404;
      throw error;
    }

    const newQuantity = inventory.quantity - amount;
    if (newQuantity < 0) {
      const error = new Error('Quantity cannot be below zero');
      error.statusCode = 400;
      throw error;
    }

    const available = newQuantity - inventory.reservedQuantity;
    if (available < 0) {
      const error = new Error('Cannot remove stock: reserved stock exceeds new quantity');
      error.statusCode = 400;
      throw error;
    }

    const updated = await inventoryRepository.update(productId, { quantity: newQuantity });

    await eventService.publish('StockRemoved', {
      inventoryId: updated.inventoryId,
      productId,
      quantity: updated.quantity,
      reservedQuantity: updated.reservedQuantity
    });

    if (updated.quantity === 0) {
      await eventService.publish('OutOfStock', {
        inventoryId: updated.inventoryId,
        productId
      });
    }

    return attachAvailable(updated);
  }

  async reserveStock(productId, amount) {
    const inventory = await inventoryRepository.findByProductId(productId);
    if (!inventory || inventory.isDeleted) {
      const error = new Error('Inventory not found');
      error.statusCode = 404;
      throw error;
    }

    const available = inventory.quantity - inventory.reservedQuantity;
    if (amount > available) {
      const error = new Error('Cannot reserve more than available stock');
      error.statusCode = 400;
      throw error;
    }

    const newReserved = inventory.reservedQuantity + amount;
    const updated = await inventoryRepository.update(productId, { reservedQuantity: newReserved });

    await eventService.publish('StockReserved', {
      inventoryId: updated.inventoryId,
      productId,
      quantity: updated.quantity,
      reservedQuantity: updated.reservedQuantity
    });

    return attachAvailable(updated);
  }

  async releaseStock(productId, amount) {
    const inventory = await inventoryRepository.findByProductId(productId);
    if (!inventory || inventory.isDeleted) {
      const error = new Error('Inventory not found');
      error.statusCode = 404;
      throw error;
    }

    const newReserved = inventory.reservedQuantity - amount;
    if (newReserved < 0) {
      const error = new Error('Cannot release more than reserved stock');
      error.statusCode = 400;
      throw error;
    }

    const updated = await inventoryRepository.update(productId, { reservedQuantity: newReserved });

    await eventService.publish('StockReleased', {
      inventoryId: updated.inventoryId,
      productId,
      quantity: updated.quantity,
      reservedQuantity: updated.reservedQuantity
    });

    return attachAvailable(updated);
  }

  async deleteInventory(productId) {
    const inventory = await inventoryRepository.findByProductId(productId);
    if (!inventory || inventory.isDeleted) {
      const error = new Error('Inventory not found');
      error.statusCode = 404;
      throw error;
    }

    await inventoryRepository.softDelete(productId);
  }

  // Consumer for ProductCreated event
  async handleEvent(eventPayload) {
    try {
      if (eventPayload.eventType === 'ProductCreated') {
        const { productId } = eventPayload.data;
        if (productId) {
          await this.createInventory(productId);
        }
      }
    } catch (err) {
      // Log and potentially send to DLQ
      console.error('Error handling event in inventory service', err);
    }
  }
}

module.exports = new InventoryService();
