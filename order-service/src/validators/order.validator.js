const { z } = require('zod');

// We mainly validate PATCH /status if exposed (the requirements say business rules only, but just in case)
const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PAYMENT_PENDING', 'PAID', 'CANCELLED', 'FAILED'])
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
  updateStatusSchema,
  validate
};
