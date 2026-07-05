const authService = require('../services/auth.service');
const { success } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return success(res, 201, 'User registered successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      return success(res, 200, 'Login successful', data);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      // req.user is set by authMiddleware
      return success(res, 200, 'Current user', req.user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
