const express = require('express');
const router = express.Router();

/**
 * Mock API cho tin đăng Project Owner
 */

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mock API cho tin đăng Project Owner',
    data: []
  });
});

module.exports = router;