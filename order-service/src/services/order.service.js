const crypto = require('crypto');
const orderRepository = require('../repositories/order.repository');
const eventService = require('./event.service');
const cartClient = require('./cart.client');
const logger = require('../utils/logger');

class OrderService {
  async createOrder(userId, token) {
    const cart = await cartClient.getCart(userId, token);
    
    if (!cart || !cart.items || cart.items.length === 0) {
      const error = new Error('Cart is empty');
      error.statusCode = 400;
      throw error;
    }

    let totalAmount = 0;
    const now = new Date().toISOString();
    
    const items = cart.items.map(item => {
      const itemTotal = item.quantity * item.price;
      totalAmount += itemTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        totalAmount: itemTotal,
        createdAt: now,
        updatedAt: now
      };
    });

    const newOrder = {
      orderId: crypto.randomUUID(),
      userId,
      items,
      totalAmount,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now
    };

    await orderRepository.create(newOrder);

    await eventService.publish('OrderCreated', {
      orderId: newOrder.orderId,
      userId: newOrder.userId,
      totalAmount: newOrder.totalAmount,
      status: newOrder.status
    });

    // Fire and forget cart clearing
    cartClient.clearCart(userId, token).catch(e => logger.error('Failed to clear cart post-order', { error: e.message }));

    return newOrder;
  }

  async getOrders(userId) {
    return orderRepository.findByUserId(userId);
  }

  async getOrder(userId, orderId) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    if (order.userId !== userId) {
      const error = new Error('Forbidden: You do not own this order');
      error.statusCode = 403;
      throw error;
    }
    return order;
  }

  async cancelOrder(userId, orderId) {
    const order = await this.getOrder(userId, orderId);

    if (order.status !== 'PENDING' && order.status !== 'PAYMENT_PENDING') {
      const error = new Error(`Cannot cancel order in ${order.status} status`);
      error.statusCode = 400;
      throw error;
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, 'CANCELLED');

    await eventService.publish('OrderCancelled', {
      orderId: updatedOrder.orderId,
      userId: updatedOrder.userId,
      totalAmount: updatedOrder.totalAmount,
      status: updatedOrder.status
    });

    return updatedOrder;
  }

  async updateStatus(orderId, newStatus) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found for status update`);
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, newStatus);

    await eventService.publish('OrderStatusChanged', {
      orderId: updatedOrder.orderId,
      userId: updatedOrder.userId,
      totalAmount: updatedOrder.totalAmount,
      status: updatedOrder.status
    });

    return updatedOrder;
  }

  async handleEvent(eventPayload) {
    try {
      const { eventType, data } = eventPayload;
      
      switch(eventType) {
        case 'PaymentSucceeded':
          await this.updateStatus(data.orderId, 'PAID');
          await eventService.publish('OrderPaid', data);
          break;
        case 'PaymentFailed':
          await this.updateStatus(data.orderId, 'FAILED');
          await eventService.publish('OrderFailed', data);
          break;
        case 'StockReserved':
          await this.updateStatus(data.orderId, 'PAYMENT_PENDING');
          break;
        case 'StockReservationFailed':
          await this.updateStatus(data.orderId, 'FAILED');
          await eventService.publish('OrderFailed', data);
          break;
        default:
          logger.debug(`Ignored event ${eventType}`);
      }
    } catch (err) {
      logger.error('Error handling event in order service', { error: err.message });
    }
  }
}

module.exports = new OrderService();
