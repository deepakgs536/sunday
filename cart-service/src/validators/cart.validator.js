const { z } = require('zod');

const addItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be a positive integer').default(1)
  })
});

const updateQuantitySchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0, 'Quantity cannot be negative')
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
  addItemSchema,
  updateQuantitySchema,
  validate
};
