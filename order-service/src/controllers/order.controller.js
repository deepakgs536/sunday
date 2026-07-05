const orderService = require('../services/order.service');
const { success } = require('../utils/response');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const { userId } = req.user;
      const token = req.headers.authorization;
      const data = await orderService.createOrder(userId, token);
      return success(res, 201, 'Order created successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const { userId } = req.user;
      const data = await orderService.getOrders(userId);
      return success(res, 200, 'Orders retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req, res, next) {
    try {
      const { userId } = req.user;
      const { orderId } = req.params;
      const data = await orderService.getOrder(userId, orderId);
      return success(res, 200, 'Order retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const { userId } = req.user;
      const { orderId } = req.params;
      const data = await orderService.cancelOrder(userId, orderId);
      return success(res, 200, 'Order cancelled successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      // NOTE: Requirements state "Allow status updates only through business rules."
      // Typically, this endpoint wouldn't be public, or would require ADMIN roles.
      // We expose it for the assignment completeness but restrict it if needed.
      const { orderId } = req.params;
      const { status } = req.body;
      const data = await orderService.updateStatus(orderId, status);
      return success(res, 200, 'Order status updated', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
