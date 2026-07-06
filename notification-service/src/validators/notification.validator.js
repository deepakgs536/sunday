const { z } = require('zod');

const sendNotificationSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    type: z.enum(['EMAIL', 'SMS', 'PUSH']),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required')
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
  sendNotificationSchema,
  validate
};
