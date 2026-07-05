const request = require('supertest');
const app = require('../src/app');
const inventoryRepository = require('../src/repositories/inventory.repository');
const eventService = require('../src/services/event.service');
const inventoryService = require('../src/services/inventory.service');

jest.mock('../src/repositories/inventory.repository');
jest.mock('../src/services/event.service');

describe('Inventory Endpoints', () => {
  const mockInventory = {
    inventoryId: 'inv-123',
    productId: 'prod-456',
    quantity: 10,
    reservedQuantity: 2,
    isDeleted: false
  };

  const validToken = 'Bearer valid-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /v1/api/inventory', () => {
    it('should create inventory for a product', async () => {
      inventoryRepository.findByProductId.mockResolvedValue(null);
      inventoryRepository.create.mockResolvedValue({});
      eventService.publish.mockResolvedValue();

      const res = await request(app)
        .post('/v1/api/inventory')
        .set('Authorization', validToken)
        .send({ productId: 'prod-456' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productId).toBe('prod-456');
      expect(res.body.data.quantity).toBe(0);
      expect(res.body.data.available).toBe(0);
      expect(eventService.publish).toHaveBeenCalledWith('InventoryCreated', expect.any(Object));
    });
  });

  describe('POST /v1/api/inventory/:productId/add', () => {
    it('should add stock successfully', async () => {
      inventoryRepository.findByProductId.mockResolvedValue(mockInventory);
      inventoryRepository.update.mockResolvedValue({
        ...mockInventory,
        quantity: 15
      });

      const res = await request(app)
        .post(`/v1/api/inventory/${mockInventory.productId}/add`)
        .set('Authorization', validToken)
        .send({ amount: 5 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.quantity).toBe(15);
      expect(res.body.data.available).toBe(13); // 15 - 2
      expect(eventService.publish).toHaveBeenCalledWith('StockAdded', expect.any(Object));
    });
  });

  describe('POST /v1/api/inventory/:productId/remove', () => {
    it('should remove stock successfully', async () => {
      inventoryRepository.findByProductId.mockResolvedValue(mockInventory);
      inventoryRepository.update.mockResolvedValue({
        ...mockInventory,
        quantity: 5
      });

      const res = await request(app)
        .post(`/v1/api/inventory/${mockInventory.productId}/remove`)
        .set('Authorization', validToken)
        .send({ amount: 5 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.quantity).toBe(5);
      expect(res.body.data.available).toBe(3); // 5 - 2
      expect(eventService.publish).toHaveBeenCalledWith('StockRemoved', expect.any(Object));
    });

    it('should fail to remove stock if it goes below reserved', async () => {
      inventoryRepository.findByProductId.mockResolvedValue(mockInventory);

      // Attempt to remove 9, quantity 10 - 9 = 1, but reserved is 2. Available would be -1.
      const res = await request(app)
        .post(`/v1/api/inventory/${mockInventory.productId}/remove`)
        .set('Authorization', validToken)
        .send({ amount: 9 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /v1/api/inventory/:productId/reserve', () => {
    it('should reserve stock successfully', async () => {
      inventoryRepository.findByProductId.mockResolvedValue(mockInventory);
      inventoryRepository.update.mockResolvedValue({
        ...mockInventory,
        reservedQuantity: 7
      });

      const res = await request(app)
        .post(`/v1/api/inventory/${mockInventory.productId}/reserve`)
        .set('Authorization', validToken)
        .send({ amount: 5 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.reservedQuantity).toBe(7);
      expect(res.body.data.available).toBe(3); // 10 - 7
      expect(eventService.publish).toHaveBeenCalledWith('StockReserved', expect.any(Object));
    });

    it('should fail if trying to reserve more than available', async () => {
      inventoryRepository.findByProductId.mockResolvedValue(mockInventory);

      // Available is 8. Trying to reserve 9.
      const res = await request(app)
        .post(`/v1/api/inventory/${mockInventory.productId}/reserve`)
        .set('Authorization', validToken)
        .send({ amount: 9 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /v1/api/inventory/:productId/release', () => {
    it('should release stock successfully', async () => {
      inventoryRepository.findByProductId.mockResolvedValue(mockInventory);
      inventoryRepository.update.mockResolvedValue({
        ...mockInventory,
        reservedQuantity: 0
      });

      const res = await request(app)
        .post(`/v1/api/inventory/${mockInventory.productId}/release`)
        .set('Authorization', validToken)
        .send({ amount: 2 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.reservedQuantity).toBe(0);
      expect(res.body.data.available).toBe(10); // 10 - 0
    });
  });

  describe('Event Consumer', () => {
    it('should automatically create inventory on ProductCreated event', async () => {
      inventoryRepository.findByProductId.mockResolvedValue(null);
      inventoryRepository.create.mockResolvedValue({});
      eventService.publish.mockResolvedValue();

      await inventoryService.handleEvent({
        eventType: 'ProductCreated',
        data: { productId: 'prod-999' }
      });

      expect(inventoryRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        productId: 'prod-999',
        quantity: 0
      }));
    });
  });
});
