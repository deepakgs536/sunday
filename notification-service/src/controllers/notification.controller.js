const notificationService = require('../services/notification.service');
const { success } = require('../utils/response');

class NotificationController {
  async sendNotification(req, res, next) {
    try {
      const { userId, type, subject, message } = req.body;
      const data = await notificationService.sendNotification(userId, type, subject, message);
      return success(res, 201, 'Notification processed', data);
    } catch (error) {
      next(error);
    }
  }

  async getNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      const data = await notificationService.getNotification(notificationId);
      return success(res, 200, 'Notification retrieved', data);
    } catch (error) {
      next(error);
    }
  }

  async getUserNotifications(req, res, next) {
    try {
      // Typically from req.user.userId, but per requirements we just return based on what auth gives.
      // Since this is generic, we'll fetch based on the authenticated user.
      const { userId } = req.user;
      const data = await notificationService.getUserNotifications(userId);
      return success(res, 200, 'Notifications retrieved', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
