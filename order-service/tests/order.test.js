const request = require('supertest');
const app = require('../src/app');
const orderRepository = require('../src/repositories/order.repository');
const eventService = require('../src/services/event.service');
const cartClient = require('../src/services/cart.client');
const inventoryClient = require('../src/services/inventory.client');
const paymentClient = require('../src/services/payment.client');
const orderService = require('../src/services/order.service');

jest.mock('../src/repositories/order.repository');
jest.mock('../src/services/event.service');
jest.mock('../src/services/cart.client');
jest.mock('../src/services/inventory.client');
jest.mock('../src/services/payment.client');

describe('Order Endpoints', () => {
  const validToken = 'Bearer user-123';
  const userId = 'user-123';

  let mockCart;
  let mockOrder;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCart = {
      cartId: 'cart-1',
      userId,
      items: [
        { productId: 'prod-1', quantity: 2, price: 50 },
        { productId: 'prod-2', quantity: 1, price: 100 }
      ]
    };

    mockOrder = {
      orderId: 'order-1',
      userId,
      items: [
        { productId: 'prod-1', quantity: 2, price: 50, totalAmount: 100, createdAt: '', updatedAt: '' },
        { productId: 'prod-2', quantity: 1, price: 100, totalAmount: 100, createdAt: '', updatedAt: '' }
      ],
      totalAmount: 200,
      status: 'PENDING'
    };
  });

  describe('POST /api/v1/orders', () => {
    it('should create order successfully', async () => {
      cartClient.getCart.mockResolvedValue(mockCart);
      cartClient.clearCart.mockResolvedValue();
      orderRepository.create.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.userId).toBe(userId);
      expect(res.body.data.totalAmount).toBe(200); // (2*50) + (1*100)
      expect(res.body.data.status).toBe('PENDING');
      expect(eventService.publish).toHaveBeenCalledWith('OrderCreated', expect.any(Object));
      expect(cartClient.clearCart).toHaveBeenCalled();
    });

    it('should fail if cart is empty', async () => {
      cartClient.getCart.mockResolvedValue({ items: [] });

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should get all orders for user', async () => {
      orderRepository.findByUserId.mockResolvedValue([mockOrder]);

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/v1/orders/:orderId', () => {
    it('should return specific order', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get('/api/v1/orders/order-1')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.orderId).toBe('order-1');
    });

    it('should fail if user does not own order', async () => {
      orderRepository.findById.mockResolvedValue({ ...mockOrder, userId: 'other-user' });

      const res = await request(app)
        .get('/api/v1/orders/order-1')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('PUT /api/v1/orders/:orderId/cancel', () => {
    it('should cancel PENDING order', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);
      orderRepository.updateStatus.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });

      const res = await request(app)
        .put('/api/v1/orders/order-1/cancel')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toBe('CANCELLED');
      expect(eventService.publish).toHaveBeenCalledWith('OrderCancelled', expect.any(Object));
    });

    it('should not cancel PAID order', async () => {
      orderRepository.findById.mockResolvedValue({ ...mockOrder, status: 'PAID' });

      const res = await request(app)
        .put('/api/v1/orders/order-1/cancel')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PATCH /api/v1/orders/:orderId/status', () => {
    it('should update status', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);
      orderRepository.updateStatus.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });

      const res = await request(app)
        .patch('/api/v1/orders/order-1/status')
        .set('Authorization', validToken)
        .send({ status: 'CONFIRMED' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(eventService.publish).toHaveBeenCalledWith('OrderStatusChanged', expect.any(Object));
    });
  });

  describe('Event Consumer', () => {
    it('should handle PaymentSucceeded and update status to PAID', async () => {
      orderRepository.findById.mockResolvedValue(mockOrder);
      orderRepository.updateStatus.mockResolvedValue({ ...mockOrder, status: 'PAID' });

      await orderService.handleEvent({
        eventType: 'PaymentSucceeded',
        data: { orderId: 'order-1' }
      });

      expect(orderRepository.updateStatus).toHaveBeenCalledWith('order-1', 'PAID');
      expect(eventService.publish).toHaveBeenCalledWith('OrderPaid', { orderId: 'order-1' });
    });
  });
});
