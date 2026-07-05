const cartService = require('../services/cart.service');
const { success } = require('../utils/response');

class CartController {
  async getCart(req, res, next) {
    try {
      const { userId } = req.user;
      const data = await cartService.getCart(userId);
      return success(res, 200, 'Cart retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const { userId } = req.user;
      const { productId, quantity } = req.body;
      const data = await cartService.addItem(userId, productId, quantity);
      return success(res, 200, 'Item added to cart', data);
    } catch (error) {
      next(error);
    }
  }

  async updateQuantity(req, res, next) {
    try {
      const { userId } = req.user;
      const { productId } = req.params;
      const { quantity } = req.body;
      const data = await cartService.updateQuantity(userId, productId, quantity);
      return success(res, 200, 'Cart item updated', data);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const { userId } = req.user;
      const { productId } = req.params;
      const data = await cartService.removeItem(userId, productId);
      return success(res, 200, 'Item removed from cart', data);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const { userId } = req.user;
      const data = await cartService.clearCart(userId);
      return success(res, 200, 'Cart cleared', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
