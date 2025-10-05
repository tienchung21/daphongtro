const express = require('express');
const router = express.Router();

/**
 * Mock API cho quản lý tin đăng
 */

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mock API cho quản lý tin đăng',
    data: []
  });
});

module.exports = router;