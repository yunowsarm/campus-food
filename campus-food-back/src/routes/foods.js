const express = require('express');
const router = express.Router();
const { list, getRecommendations, getById, create, update, remove } = require('../controllers/foodController');
const { listByFood } = require('../controllers/reviewController');
const { auth, optionalAuth, requireRole } = require('../middleware/auth');

router.get('/', optionalAuth, list);
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/:id/reviews', listByFood);
router.get('/:id', optionalAuth, getById);
router.post('/', auth, requireRole('merchant'), create);
router.put('/:id', auth, requireRole('merchant'), update);
router.delete('/:id', auth, requireRole('merchant'), remove);

module.exports = router;
