const express = require('express');
const router = express.Router();
const tc = require('../controllers/transactionController');
console.log('transactionController:', typeof tc, 'list:', typeof tc.list, 'create:', typeof tc.create);

router.get('/', tc.list);        // GET /api/transactions
router.get('/:id', tc.getById); // GET /api/transactions/:id
router.post('/', tc.create);     // POST /api/transactions
router.put('/:id', tc.update);   // PUT /api/transactions/:id
router.delete('/:id', tc.delete); // DELETE /api/transactions/:id

module.exports = router;