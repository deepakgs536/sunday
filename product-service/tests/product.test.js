const request = require('supertest');
const app = require('../src/app');
const productRepository = require('../src/repositories/product.repository');
const eventService = require('../src/services/event.service');

jest.mock('../src/repositories/product.repository');
jest.mock('../src/services/event.service');

describe('Product Endpoints', () => {
  const mockProduct = {
    productId: '123-abc',
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    category: 'Electronics',
    isActive: true,
    isDeleted: false
  };

  const validToken = 'Bearer valid-token'; // Bypasses mock auth middleware

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /v1/api/products', () => {
    it('should create a new product successfully', async () => {
      productRepository.create.mockResolvedValue({});
      eventService.publish.mockResolvedValue();

      const res = await request(app)
        .post('/v1/api/products')
        .set('Authorization', validToken)
        .send({
          name: 'Test Product',
          description: 'This is a test product',
          price: 99.99,
          category: 'Electronics'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Product');
      expect(eventService.publish).toHaveBeenCalledWith('ProductCreated', expect.any(Object));
    });

    it('should fail if validation errors exist', async () => {
      const res = await request(app)
        .post('/v1/api/products')
        .set('Authorization', validToken)
        .send({
          name: 'T', // too short
          price: -10 // negative
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /v1/api/products/:id', () => {
    it('should retrieve a product by ID', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);

      const res = await request(app).get(`/v1/api/products/${mockProduct.productId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productId).toBe(mockProduct.productId);
    });

    it('should return 404 if product not found', async () => {
      productRepository.findById.mockResolvedValue(null);
      const res = await request(app).get('/v1/api/products/wrong-id');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /v1/api/products/:id', () => {
    it('should update a product successfully', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.update.mockResolvedValue({
        ...mockProduct,
        price: 89.99
      });

      const res = await request(app)
        .put(`/v1/api/products/${mockProduct.productId}`)
        .set('Authorization', validToken)
        .send({ price: 89.99 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.price).toBe(89.99);
      expect(eventService.publish).toHaveBeenCalledWith('ProductUpdated', expect.any(Object));
    });
  });

  describe('DELETE /v1/api/products/:id', () => {
    it('should soft delete a product successfully', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.softDelete.mockResolvedValue();

      const res = await request(app)
        .delete(`/v1/api/products/${mockProduct.productId}`)
        .set('Authorization', validToken);

      expect(res.statusCode).toEqual(200);
      expect(eventService.publish).toHaveBeenCalledWith('ProductDeleted', expect.any(Object));
    });
  });
});
