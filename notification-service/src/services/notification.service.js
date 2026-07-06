const crypto = require('crypto');
const notificationRepository = require('../repositories/notification.repository');
const emailService = require('./email.service');
const smsService = require('./sms.service');
const eventService = require('./event.service');
const logger = require('../utils/logger');

class NotificationService {
  async sendNotification(userId, type, subject, message, contactInfo = 'default@example.com') {
    const notificationId = crypto.randomUUID();
    
    const notification = {
      notificationId,
      userId,
      type,
      subject,
      message,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await notificationRepository.create(notification);

    try {
      if (type === 'EMAIL') {
        await emailService.sendEmail(contactInfo, subject, message);
      } else if (type === 'SMS') {
        await smsService.sendSMS(contactInfo, message);
      } else if (type === 'PUSH') {
        logger.info(`[MOCK PUSH] Push notification sent to user ${userId}: ${subject}`);
      } else {
        throw new Error(`Unsupported notification type: ${type}`);
      }

      await notificationRepository.updateStatus(notificationId, 'SENT');
      
      await eventService.publish('NotificationSent', {
        notificationId,
        userId,
        type,
        status: 'SENT'
      });

      return { ...notification, status: 'SENT' };
    } catch (error) {
      logger.error('Failed to send notification', { error: error.message, notificationId });
      
      await notificationRepository.updateStatus(notificationId, 'FAILED');
      
      await eventService.publish('NotificationFailed', {
        notificationId,
        userId,
        type,
        status: 'FAILED',
        reason: error.message
      });

      return { ...notification, status: 'FAILED' };
    }
  }

  async getNotification(notificationId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }
    return notification;
  }

  async getUserNotifications(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  async handleEvent(eventPayload) {
    try {
      const { eventType, data } = eventPayload;
      // In a real system, we'd lookup the user's email/phone based on data.userId.
      // For this implementation, we assume a mock contact.
      const userId = data.userId || 'unknown-user';
      const mockEmail = `user-${userId}@example.com`;

      switch(eventType) {
        case 'UserRegistered':
          await this.sendNotification(userId, 'EMAIL', 'Welcome to Sunday!', 'We are glad to have you.', mockEmail);
          break;
        case 'OrderCreated':
          await this.sendNotification(userId, 'EMAIL', `Order Confirmation: ${data.orderId}`, 'Your order has been received.', mockEmail);
          break;
        case 'OrderCancelled':
          await this.sendNotification(userId, 'EMAIL', `Order Cancelled: ${data.orderId}`, 'Your order was successfully cancelled.', mockEmail);
          break;
        case 'PaymentSucceeded':
          await this.sendNotification(userId, 'EMAIL', `Payment Received for Order: ${data.orderId}`, 'Thank you for your payment.', mockEmail);
          break;
        case 'PaymentFailed':
          await this.sendNotification(userId, 'EMAIL', `Payment Failed for Order: ${data.orderId}`, 'Unfortunately, your payment failed. Please try again.', mockEmail);
          break;
        case 'PasswordChanged':
          await this.sendNotification(userId, 'EMAIL', 'Security Alert: Password Changed', 'Your password was recently changed.', mockEmail);
          break;
        default:
          logger.debug(`Ignored event ${eventType} in Notification Service`);
      }
    } catch (err) {
      logger.error('Error handling event in Notification Service', { error: err.message });
    }
  }
}

module.exports = new NotificationService();
