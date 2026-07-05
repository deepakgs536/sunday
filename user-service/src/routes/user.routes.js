const express = require('express');
const userController = require('../controllers/user.controller');
const { validate, updateProfileSchema, changePasswordSchema, uploadUrlSchema } = require('../validators/user.validator');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.put('/password', validate(changePasswordSchema), userController.changePassword);
router.delete('/', userController.deleteUser);
router.post('/upload-url', validate(uploadUrlSchema), userController.generateUploadUrl);

module.exports = router;
