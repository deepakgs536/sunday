const { z } = require('zod');

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be greater than 0'),
    category: z.string().min(2, 'Category is required'),
    image: z.string().url('Image must be a valid URL').optional(),
    isActive: z.boolean().optional()
  })
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    category: z.string().min(2).optional(),
    image: z.string().url().optional(),
    isActive: z.boolean().optional()
  })
});

const uploadUrlSchema = z.object({
  body: z.object({
    fileName: z.string().min(1, 'File name is required'),
    contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/, 'Invalid content type. Must be an image.')
  })
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  uploadUrlSchema,
  validate
};
