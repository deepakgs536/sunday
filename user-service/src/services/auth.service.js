const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const eventService = require('./event.service');
const { generateToken } = require('../utils/jwt');

class AuthService {
  async register(data) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser = {
      userId: crypto.randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      phone: data.phone || null,
      role: 'CUSTOMER', // Default role for public registration
      status: 'ACTIVE',
      profileImage: null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };

    await userRepository.create(newUser);

    // Remove passwordHash before returning and publishing
    const { passwordHash: _hash, ...userResponse } = newUser;

    await eventService.publish('UserRegistered', userResponse);

    return userResponse;
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.isDeleted) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    const token = generateToken(tokenPayload);

    const { passwordHash: _hash, ...userResponse } = user;

    return { user: userResponse, token };
  }
}

module.exports = new AuthService();
