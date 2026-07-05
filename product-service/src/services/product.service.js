const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const productRepository = require('../repositories/product.repository');
const eventService = require('./event.service');
const { s3Client } = require('../config/aws');
const env = require('../config/env');

class ProductService {
  async createProduct(data) {
    const newProduct = {
      productId: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };

    await productRepository.create(newProduct);
    await eventService.publish('ProductCreated', {
      productId: newProduct.productId,
      name: newProduct.name,
      category: newProduct.category
    });

    return newProduct;
  }

  async getProduct(productId) {
    const product = await productRepository.findById(productId);
    if (!product || product.isDeleted) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async getAllProducts(params) {
    return await productRepository.findAll(params);
  }

  async updateProduct(productId, updateData) {
    const product = await productRepository.findById(productId);
    if (!product || product.isDeleted) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const { productId: uid, ...allowedUpdates } = updateData;
    const updatedProduct = await productRepository.update(productId, allowedUpdates);

    if (updatedProduct) {
      await eventService.publish('ProductUpdated', {
        productId: updatedProduct.productId,
        name: updatedProduct.name,
        category: updatedProduct.category
      });
    }

    return updatedProduct;
  }

  async deleteProduct(productId) {
    const product = await productRepository.findById(productId);
    if (!product || product.isDeleted) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    await productRepository.softDelete(productId);
    
    await eventService.publish('ProductDeleted', {
      productId: product.productId,
      name: product.name,
      category: product.category
    });
  }

  async generateUploadUrl(fileName, contentType) {
    const fileExt = fileName.split('.').pop();
    const fileKey = `products/${crypto.randomUUID()}.${fileExt}`;
    
    const command = new PutObjectCommand({
      Bucket: env.PRODUCT_BUCKET,
      Key: fileKey,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const imageUrl = `https://${env.PRODUCT_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return { uploadUrl, fileKey, imageUrl };
  }
}

module.exports = new ProductService();
