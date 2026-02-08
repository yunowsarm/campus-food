const express = require('express');
const router = express.Router();
const { list, getMe, getById, create, update, getStats } = require('../controllers/merchantController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', list);
router.get('/me', auth, requireRole('merchant'), getMe);
router.get('/stats', auth, requireRole('merchant'), getStats);
router.get('/:id', getById);
router.post('/', auth, requireRole('merchant'), create);
router.put('/:id', auth, requireRole('merchant'), update);

module.exports = router;
