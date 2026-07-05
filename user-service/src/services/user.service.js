const bcrypt = require('bcrypt');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const eventService = require('./event.service');
const { s3Client } = require('../config/aws');
const env = require('../config/env');

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user || user.isDeleted) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    const { passwordHash: _hash, ...userResponse } = user;
    return userResponse;
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user || user.isDeleted) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Explicitly prevent password and role updates via this method
    const { passwordHash, role, email, userId: uid, ...allowedUpdates } = updateData;
    
    const updatedUser = await userRepository.update(userId, allowedUpdates);
    const { passwordHash: _hash, ...userResponse } = updatedUser;

    await eventService.publish('UserUpdated', userResponse);

    return userResponse;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user || user.isDeleted) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid old password');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await userRepository.update(userId, { passwordHash: newPasswordHash });
    
    await eventService.publish('PasswordChanged', { userId });
  }

  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user || user.isDeleted) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await userRepository.softDelete(userId);
    
    await eventService.publish('UserDeleted', { userId });
  }

  async generateUploadUrl(userId, fileName, contentType) {
    const user = await userRepository.findById(userId);
    if (!user || user.isDeleted) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const fileExt = fileName.split('.').pop();
    const fileKey = `profiles/${userId}/${crypto.randomUUID()}.${fileExt}`;
    
    const command = new PutObjectCommand({
      Bucket: env.PROFILE_BUCKET,
      Key: fileKey,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const imageUrl = `https://${env.PROFILE_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // Optionally update user profile with the new image URL immediately,
    // or wait for a webhook/frontend update. We will let the frontend call updateProfile.

    return { uploadUrl, fileKey, imageUrl };
  }
}

module.exports = new UserService();
