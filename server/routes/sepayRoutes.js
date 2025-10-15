const express = require('express');
const router = express.Router();
const sepayCtrl = require('../controllers/sepayController');
const sepaySync = require('../services/sepaySyncService');

// GET /api/sepay/transactions or /api/sepay/transactions?from=...&to=...
router.get('/transactions', sepayCtrl.getTransactions);

// POST /api/sepay/sync-now
router.post('/sync-now', async (req, res) => {
  try {
    const stats = await sepaySync.syncOnce(req.body || {});
    return res.json({ message: 'Sync completed', stats });
  } catch (err) {
    const details = err.response?.data || err.message || err;
    return res.status(err.response?.status || 500).json({ error: 'Sync failed', details });
  }
});

module.exports = router;