const request = require('supertest');
const app = require('../src/app');

// Mock external dependencies
jest.mock('../src/repositories/user.repository');
jest.mock('../src/services/event.service');

const userRepository = require('../src/repositories/user.repository');
const eventService = require('../src/services/event.service');
const bcrypt = require('bcrypt');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({});
      eventService.publish.mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('john@example.com');
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    it('should return 409 if email exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ userId: '123' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const mockHash = await bcrypt.hash('password123', 10);
      userRepository.findByEmail.mockResolvedValue({
        userId: '123',
        email: 'john@example.com',
        passwordHash: mockHash,
        role: 'CUSTOMER'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('john@example.com');
    });

    it('should return 401 for wrong password', async () => {
      const mockHash = await bcrypt.hash('password123', 10);
      userRepository.findByEmail.mockResolvedValue({
        userId: '123',
        email: 'john@example.com',
        passwordHash: mockHash,
        role: 'CUSTOMER'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });
});
