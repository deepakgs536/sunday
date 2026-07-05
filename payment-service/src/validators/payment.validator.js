const { z } = require('zod');

const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().min(3).max(3).default('USD'),
    paymentMethod: z.string().min(1, 'Payment method is required')
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
  createPaymentSchema,
  validate
};
