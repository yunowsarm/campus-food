const express = require('express');
const router = express.Router();
const { list, create, update, remove } = require('../controllers/categoryController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', list);
router.post('/', auth, requireRole('merchant'), create);
router.put('/:id', auth, requireRole('merchant'), update);
router.delete('/:id', auth, requireRole('merchant'), remove);

module.exports = router;
