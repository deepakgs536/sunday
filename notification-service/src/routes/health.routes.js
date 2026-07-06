const express = require('express');
const { success } = require('../utils/response');
const router = express.Router();

router.get('/', (req, res) => {
  return success(res, 200, 'Notification Service is healthy', {
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
