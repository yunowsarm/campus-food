const express = require('express');
const router = express.Router();
const deliveryCtrl = require('../controllers/deliveryController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('delivery'), deliveryCtrl.list);
router.get('/pending', auth, requireRole('delivery'), deliveryCtrl.listPending);
router.get('/:id', auth, deliveryCtrl.getById);
router.post('/:id/accept', auth, requireRole('delivery'), deliveryCtrl.accept);
router.post('/:id/picking', auth, requireRole('delivery'), deliveryCtrl.picking);
router.post('/:id/delivering', auth, requireRole('delivery'), deliveryCtrl.delivering);
router.post('/:id/complete', auth, requireRole('delivery'), deliveryCtrl.complete);

module.exports = router;
