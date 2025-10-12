const express = require('express');
const router = express.Router();
const kv = require('../controllers/khuVucController');

router.get('/', kv.getAll);         // list flat
router.get('/tree', kv.getTree);   // hierarchical tree
router.get('/:id', kv.getById);
router.post('/', kv.create);
router.put('/:id', kv.update);
router.delete('/:id', kv.delete);

module.exports = router;