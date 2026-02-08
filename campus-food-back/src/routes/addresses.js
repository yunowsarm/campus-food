const express = require('express');
const router = express.Router();
const { list, create, update, remove } = require('../controllers/addressController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('student'), list);
router.post('/', auth, requireRole('student'), create);
router.put('/:id', auth, requireRole('student'), update);
router.delete('/:id', auth, requireRole('student'), remove);

module.exports = router;
