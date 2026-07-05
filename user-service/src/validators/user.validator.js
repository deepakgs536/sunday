const { z } = require('zod');

const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    profileImage: z.string().url().optional()
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
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
  updateProfileSchema,
  changePasswordSchema,
  uploadUrlSchema,
  validate
};
