const request = require('supertest');
const app = require('../src/app');
const { generateToken } = require('../src/utils/jwt');

jest.mock('../src/repositories/user.repository');
jest.mock('../src/services/event.service');

const userRepository = require('../src/repositories/user.repository');
const eventService = require('../src/services/event.service');

describe('User Endpoints', () => {
  let token;
  const mockUser = {
    userId: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'CUSTOMER',
    passwordHash: 'hashedpassword'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    token = generateToken({
      userId: mockUser.userId,
      email: mockUser.email,
      role: mockUser.role
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe(mockUser.userId);
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update profile', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Jane'
      });
      eventService.publish.mockResolvedValue();

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Jane'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.firstName).toBe('Jane');
    });
  });
});
