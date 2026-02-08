const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');
const { auth, requireRole } = require('../middleware/auth');

router.post('/', auth, requireRole('student'), orderCtrl.create);
router.get('/', auth, orderCtrl.list);
router.get('/:id', auth, orderCtrl.getById);
router.post('/:id/pay', auth, requireRole('student'), orderCtrl.pay);
router.post('/:id/cancel', auth, requireRole('student'), orderCtrl.cancel);
router.post('/:id/refund', auth, requireRole('student'), orderCtrl.requestRefund);
router.post('/:id/refund/approve', auth, requireRole('merchant', 'admin'), orderCtrl.approveRefund);
router.post('/:id/refund/reject', auth, requireRole('merchant', 'admin'), orderCtrl.rejectRefund);
router.post('/:id/startPreparing', auth, requireRole('merchant'), orderCtrl.startPreparing);
router.post('/:id/finishPreparing', auth, requireRole('merchant'), orderCtrl.finishPreparing);

module.exports = router;
