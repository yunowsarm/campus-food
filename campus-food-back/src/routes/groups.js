const express = require('express');
const router = express.Router();
const { list, getById, create, join, cancel } = require('../controllers/groupController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', list);
router.get('/:id', getById);
router.post('/', auth, requireRole('student'), create);
router.post('/:id/join', auth, requireRole('student'), join);
router.post('/:id/cancel', auth, requireRole('student'), cancel);

module.exports = router;
