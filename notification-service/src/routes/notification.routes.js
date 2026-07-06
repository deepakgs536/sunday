const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { validate, sendNotificationSchema } = require('../validators/notification.validator');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.getUserNotifications);
router.post('/send', validate(sendNotificationSchema), notificationController.sendNotification);
router.get('/:notificationId', notificationController.getNotification);

module.exports = router;
