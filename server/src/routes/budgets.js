const express = require('express');
const router = express.Router();
const controller = require('../controllers/budgetsController');

router.get('/', controller.getAll);
router.put('/', controller.upsert);
router.delete('/:id', controller.remove);

module.exports = router;
