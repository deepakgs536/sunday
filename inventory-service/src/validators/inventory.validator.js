const { z } = require('zod');

const createInventorySchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required')
  })
});

const stockOperationSchema = z.object({
  body: z.object({
    amount: z.coerce.number().int().positive('Amount must be a positive integer')
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
  createInventorySchema,
  stockOperationSchema,
  validate
};
