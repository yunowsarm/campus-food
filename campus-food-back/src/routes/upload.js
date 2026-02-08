const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');

router.post('/single', auth, uploadSingle);
router.post('/multiple', auth, uploadMultiple);

module.exports = router;
