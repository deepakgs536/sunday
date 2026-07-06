const request = require('supertest');
const app = require('../src/app');
const notificationRepository = require('../src/repositories/notification.repository');
const eventService = require('../src/services/event.service');
const emailService = require('../src/services/email.service');
const smsService = require('../src/services/sms.service');
const notificationService = require('../src/services/notification.service');

jest.mock('../src/repositories/notification.repository');
jest.mock('../src/services/event.service');
jest.mock('../src/services/email.service');
jest.mock('../src/services/sms.service');

describe('Notification Endpoints and Consumer logic', () => {
  const validToken = 'Bearer user-123';
  const userId = 'user-123';

  let mockNotification;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNotification = {
      notificationId: 'notif-1',
      userId,
      type: 'EMAIL',
      subject: 'Test Subject',
      message: 'Test Message',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
  });

  describe('POST /api/v1/notifications/send', () => {
    it('should create and send EMAIL notification successfully', async () => {
      emailService.sendEmail.mockResolvedValue({ success: true, messageId: 'm-id' });
      notificationRepository.create.mockResolvedValue(mockNotification);
      notificationRepository.updateStatus.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/notifications/send')
        .set('Authorization', validToken)
        .send({
          userId: 'user-123',
          type: 'EMAIL',
          subject: 'Test Subject',
          message: 'Test Message'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.status).toBe('SENT');
      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(eventService.publish).toHaveBeenCalledWith('NotificationSent', expect.any(Object));
    });

    it('should handle EMAIL failure correctly', async () => {
      emailService.sendEmail.mockRejectedValue(new Error('SES failed'));
      notificationRepository.create.mockResolvedValue(mockNotification);
      notificationRepository.updateStatus.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/notifications/send')
        .set('Authorization', validToken)
        .send({
          userId: 'user-123',
          type: 'EMAIL',
          subject: 'Test Subject',
          message: 'Test Message'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.status).toBe('FAILED');
      expect(eventService.publish).toHaveBeenCalledWith('NotificationFailed', expect.any(Object));
    });

    it('should create and send SMS notification successfully', async () => {
      smsService.sendSMS.mockResolvedValue({ success: true, messageId: 'm-id' });
      notificationRepository.create.mockResolvedValue(mockNotification);
      notificationRepository.updateStatus.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/notifications/send')
        .set('Authorization', validToken)
        .send({
          userId: 'user-123',
          type: 'SMS',
          subject: 'Test Subject',
          message: 'Test Message'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.status).toBe('SENT');
      expect(smsService.sendSMS).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should get all notifications for a user', async () => {
      notificationRepository.findByUserId.mockResolvedValue([mockNotification]);
      
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', validToken);
        
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/v1/notifications/:notificationId', () => {
    it('should get specific notification', async () => {
      notificationRepository.findById.mockResolvedValue(mockNotification);
      
      const res = await request(app)
        .get('/api/v1/notifications/notif-1')
        .set('Authorization', validToken);
        
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.notificationId).toBe('notif-1');
    });
  });

  describe('Event Consumer Logic', () => {
    it('should send welcome email on UserRegistered event', async () => {
      emailService.sendEmail.mockResolvedValue({ success: true, messageId: 'm-id' });
      
      await notificationService.handleEvent({
        eventType: 'UserRegistered',
        data: { userId: 'u-1' }
      });
      
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        'user-u-1@example.com',
        'Welcome to Sunday!',
        expect.any(String)
      );
    });

    it('should send order confirmation on OrderCreated event', async () => {
      emailService.sendEmail.mockResolvedValue({ success: true, messageId: 'm-id' });
      
      await notificationService.handleEvent({
        eventType: 'OrderCreated',
        data: { userId: 'u-1', orderId: 'ord-1' }
      });
      
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        'user-u-1@example.com',
        'Order Confirmation: ord-1',
        expect.any(String)
      );
    });
  });
});
