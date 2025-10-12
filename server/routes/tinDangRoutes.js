const express = require('express');
const router = express.Router();
const tinController = require('../controllers/tinDangController');

router.get('/', tinController.getAll);
router.post('/', tinController.create);
router.get('/:id', tinController.getById);
router.put('/:id', tinController.update);
router.delete('/:id', tinController.delete);

// approve/reject
router.post('/:id/approve', tinController.approve);

module.exports = router;