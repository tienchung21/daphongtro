const express = require('express');
const router = express.Router();
const sepayCtrl = require('../controllers/sepayCallbackController');

router.post('/callback', sepayCtrl.callback);      // POST /api/sepay/callback
router.get('/callbacks', sepayCtrl.listCallbacks); // GET  /api/sepay/callbacks  (dev inspect)

module.exports = router;