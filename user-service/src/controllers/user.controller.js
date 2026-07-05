const userService = require('../services/user.service');
const { success } = require('../utils/response');

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.userId);
      return success(res, 200, 'User profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.userId, req.body);
      return success(res, 200, 'Profile updated successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await userService.changePassword(req.user.userId, oldPassword, newPassword);
      return success(res, 200, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.user.userId);
      return success(res, 200, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async generateUploadUrl(req, res, next) {
    try {
      const { fileName, contentType } = req.body;
      const data = await userService.generateUploadUrl(req.user.userId, fileName, contentType);
      return success(res, 200, 'Upload URL generated successfully', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
