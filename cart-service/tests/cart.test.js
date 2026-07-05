const request = require('supertest');
const app = require('../src/app');
const cartRepository = require('../src/repositories/cart.repository');
const eventService = require('../src/services/event.service');
const inventoryClient = require('../src/services/inventory.client');
const productClient = require('../src/services/product.client');
const cartService = require('../src/services/cart.service');

jest.mock('../src/repositories/cart.repository');
jest.mock('../src/services/event.service');
jest.mock('../src/services/inventory.client');
jest.mock('../src/services/product.client');

describe('Cart Endpoints', () => {
  const validToken = 'Bearer user-123'; // Decodes to userId: user-123 in mock middleware
  const userId = 'user-123';
  
  let emptyCart;
  let populatedCart;

  beforeEach(() => {
    jest.clearAllMocks();
    
    emptyCart = {
      cartId: 'cart-1',
      userId,
      items: []
    };

    populatedCart = {
      cartId: 'cart-1',
      userId,
      items: [
        {
          productId: 'prod-1',
          quantity: 2,
          isAvailable: true
        }
      ]
    };
  });

  describe('GET /api/v1/cart', () => {
    it('should return existing cart', async () => {
      cartRepository.findByUserId.mockResolvedValue(emptyCart);

      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.cartId).toBe('cart-1');
      expect(eventService.publish).not.toHaveBeenCalled(); // No CartCreated event
    });

    it('should create and return new cart if none exists', async () => {
      cartRepository.findByUserId.mockResolvedValue(null);
      cartRepository.create.mockResolvedValue({});
      eventService.publish.mockResolvedValue();

      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.userId).toBe(userId);
      expect(eventService.publish).toHaveBeenCalledWith('CartCreated', expect.any(Object));
    });
  });

  describe('POST /api/v1/cart/items', () => {
    it('should add item successfully', async () => {
      cartRepository.findByUserId.mockResolvedValue(emptyCart);
      productClient.getProduct.mockResolvedValue({ productId: 'prod-1' });
      inventoryClient.checkStock.mockResolvedValue({ isAvailable: true });
      cartRepository.save.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', validToken)
        .send({ productId: 'prod-1', quantity: 2 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items[0].productId).toBe('prod-1');
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(eventService.publish).toHaveBeenCalledWith('ItemAdded', expect.any(Object));
    });

    it('should fail if stock is unavailable', async () => {
      cartRepository.findByUserId.mockResolvedValue(emptyCart);
      productClient.getProduct.mockResolvedValue({ productId: 'prod-1' });
      inventoryClient.checkStock.mockResolvedValue({ isAvailable: false });

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', validToken)
        .send({ productId: 'prod-1', quantity: 10 });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PUT /api/v1/cart/items/:productId', () => {
    it('should update quantity successfully', async () => {
      cartRepository.findByUserId.mockResolvedValue(populatedCart);
      inventoryClient.checkStock.mockResolvedValue({ isAvailable: true });
      cartRepository.save.mockResolvedValue({});

      const res = await request(app)
        .put('/api/v1/cart/items/prod-1')
        .set('Authorization', validToken)
        .send({ quantity: 5 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items[0].quantity).toBe(5);
      expect(eventService.publish).toHaveBeenCalledWith('ItemUpdated', expect.any(Object));
    });

    it('should remove item if quantity is zero', async () => {
      cartRepository.findByUserId.mockResolvedValue(populatedCart);
      cartRepository.save.mockResolvedValue({});

      const res = await request(app)
        .put('/api/v1/cart/items/prod-1')
        .set('Authorization', validToken)
        .send({ quantity: 0 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items.length).toBe(0);
      expect(eventService.publish).toHaveBeenCalledWith('ItemRemoved', expect.any(Object));
    });
  });

  describe('DELETE /api/v1/cart/items/:productId', () => {
    it('should remove item completely', async () => {
      cartRepository.findByUserId.mockResolvedValue(populatedCart);
      cartRepository.save.mockResolvedValue({});

      const res = await request(app)
        .delete('/api/v1/cart/items/prod-1')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items.length).toBe(0);
      expect(eventService.publish).toHaveBeenCalledWith('ItemRemoved', expect.any(Object));
    });
  });

  describe('DELETE /api/v1/cart', () => {
    it('should clear cart', async () => {
      cartRepository.findByUserId.mockResolvedValue(populatedCart);
      cartRepository.save.mockResolvedValue({});

      const res = await request(app)
        .delete('/api/v1/cart')
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items.length).toBe(0);
      expect(eventService.publish).toHaveBeenCalledWith('CartCleared', expect.any(Object));
    });
  });
});
