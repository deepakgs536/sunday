const request = require('supertest');
const app = require('../src/app');
const paymentRepository = require('../src/repositories/payment.repository');
const eventService = require('../src/services/event.service');
const gatewayService = require('../src/services/gateway.service');
const paymentService = require('../src/services/payment.service');

jest.mock('../src/repositories/payment.repository');
jest.mock('../src/services/event.service');
jest.mock('../src/services/gateway.service');

describe('Payment Endpoints', () => {
  const validToken = 'Bearer user-123';
  const userId = 'user-123';

  let mockPayment;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPayment = {
      paymentId: 'pay-1',
      orderId: 'order-1',
      userId,
      amount: 500,
      currency: 'USD',
      paymentMethod: 'CARD',
      transactionId: 'txn-1',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  describe('POST /api/v1/payments', () => {
    it('should create payment successfully', async () => {
      gatewayService.processPayment.mockResolvedValue({ transactionId: 'txn-1', success: true });
      paymentRepository.create.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', validToken)
        .send({
          orderId: 'order-1',
          amount: 500,
          currency: 'USD',
          paymentMethod: 'CARD'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.status).toBe('PENDING');
      expect(eventService.publish).toHaveBeenCalledWith('PaymentCreated', expect.any(Object));
    });
  });

  describe('POST /api/v1/payments/verify', () => {
    it('should verify and update to SUCCESS', async () => {
      paymentRepository.findById.mockResolvedValue(mockPayment);
      gatewayService.verifyPayment.mockResolvedValue({ success: true, status: 'SUCCESS' });
      paymentRepository.updateStatus.mockResolvedValue({ ...mockPayment, status: 'SUCCESS' });

      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', validToken)
        .send({ paymentId: 'pay-1' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toBe('SUCCESS');
      expect(eventService.publish).toHaveBeenCalledWith('PaymentSucceeded', expect.any(Object));
    });

    it('should fail if already SUCCESS', async () => {
      paymentRepository.findById.mockResolvedValue({ ...mockPayment, status: 'SUCCESS' });

      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', validToken)
        .send({ paymentId: 'pay-1' });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/v1/payments/refund', () => {
    it('should refund SUCCESS payment', async () => {
      paymentRepository.findById.mockResolvedValue({ ...mockPayment, status: 'SUCCESS' });
      gatewayService.refundPayment.mockResolvedValue({ success: true, refundId: 'ref-1' });
      paymentRepository.updateStatus.mockResolvedValue({ ...mockPayment, status: 'REFUNDED' });

      const res = await request(app)
        .post('/api/v1/payments/refund')
        .set('Authorization', validToken)
        .send({ paymentId: 'pay-1' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toBe('REFUNDED');
      expect(eventService.publish).toHaveBeenCalledWith('PaymentRefunded', expect.any(Object));
    });

    it('should not refund PENDING payment', async () => {
      paymentRepository.findById.mockResolvedValue(mockPayment);

      const res = await request(app)
        .post('/api/v1/payments/refund')
        .set('Authorization', validToken)
        .send({ paymentId: 'pay-1' });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/v1/payments/webhook', () => {
    it('should handle webhook event', async () => {
      paymentRepository.findById.mockResolvedValue(mockPayment);
      gatewayService.verifyPayment.mockResolvedValue({ success: true, status: 'SUCCESS' });
      paymentRepository.updateStatus.mockResolvedValue({ ...mockPayment, status: 'SUCCESS' });

      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('stripe-signature', 'valid_sig')
        .send({ paymentId: 'pay-1', status: 'succeeded' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toBe('SUCCESS');
    });
  });
});
