const express = require('express');
const router = express.Router();
const { list, toggle } = require('../controllers/favoriteController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('student'), list);
router.post('/toggle', auth, requireRole('student'), toggle);

module.exports = router;
