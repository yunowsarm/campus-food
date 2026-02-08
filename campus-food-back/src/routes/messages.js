const express = require('express');
const router = express.Router();
const { list, getOne, read, readAll } = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

router.get('/', auth, list);
router.get('/:id', auth, getOne);
router.post('/:id/read', auth, read);
router.post('/readAll', auth, readAll);

module.exports = router;
