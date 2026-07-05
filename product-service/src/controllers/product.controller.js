const productService = require('../services/product.service');
const { success } = require('../utils/response');

class ProductController {
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      return success(res, 201, 'Product created successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.getProduct(id);
      return success(res, 200, 'Product retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async getAllProducts(req, res, next) {
    try {
      const { category, search, limit, lastEvaluatedKey } = req.query;
      
      const params = {
        category,
        search,
        limit: limit ? parseInt(limit, 10) : 10,
        lastEvaluatedKey
      };

      const result = await productService.getAllProducts(params);
      
      return success(res, 200, 'Products retrieved successfully', result.items, {
        nextKey: result.nextKey
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      return success(res, 200, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);
      return success(res, 200, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async generateUploadUrl(req, res, next) {
    try {
      const { fileName, contentType } = req.body;
      const data = await productService.generateUploadUrl(fileName, contentType);
      return success(res, 200, 'Upload URL generated successfully', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
