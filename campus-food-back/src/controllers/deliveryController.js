const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const User = require('../models/User');
const { createMessage } = require('../utils/messageHelper');
//配送列表、待抢单、详情、抢单、取餐、配送中、送达完成
async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const filter = {};
    if (req.role === 'delivery') filter.riderId = req.userId;
    if (status) filter.status = status;
    const [list, total] = await Promise.all([
      Delivery.find(filter).populate('merchantId', 'name address').sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)).lean(),
      Delivery.countDocuments(filter),
    ]);
    res.json({ code: 0, data: { list, total, page: Number(page), pageSize: Number(pageSize) } });
  } catch (err) {
    next(err);
  }
}

/** 待抢单列表（配送端） */
async function listPending(req, res, next) {
  try {
    const list = await Delivery.find({ status: 'pending' }).populate('merchantId', 'name address').sort({ createdAt: -1 }).limit(50).lean();
    res.json({ code: 0, data: list });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const delivery = await Delivery.findById(req.params.id).populate('merchantId').populate('orderIds').lean();
    if (!delivery) return res.status(404).json({ code: 404, message: '配送单不存在' });
    res.json({ code: 0, data: delivery });
  } catch (err) {
    next(err);
  }
}

/** 骑手抢单 */
async function accept(req, res, next) {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ code: 404, message: '配送单不存在' });
    if (delivery.status !== 'pending') return res.status(400).json({ code: 400, message: '该单已被接单' });
    delivery.riderId = req.userId;
    delivery.status = 'accepted';
    delivery.acceptedAt = new Date();
    await delivery.save();
    await User.findByIdAndUpdate(req.userId, { deliveryStatus: 'busy', currentDeliveryId: delivery._id });
    res.json({ code: 0, data: delivery });
  } catch (err) {
    next(err);
  }
}

/** 到店取餐 */
async function picking(req, res, next) {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ code: 404, message: '配送单不存在' });
    if (delivery.riderId?.toString() !== req.userId.toString()) return res.status(403).json({ code: 403, message: '无权限' });
    if (delivery.status !== 'accepted') return res.status(400).json({ code: 400, message: '状态不允许' });
    delivery.status = 'picking';
    delivery.pickedAt = new Date();
    await delivery.save();
    res.json({ code: 0, data: delivery });
  } catch (err) {
    next(err);
  }
}

/** 配送中 */
async function delivering(req, res, next) {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ code: 404, message: '配送单不存在' });
    if (delivery.riderId?.toString() !== req.userId.toString()) return res.status(403).json({ code: 403, message: '无权限' });
    if (!['accepted', 'picking'].includes(delivery.status)) return res.status(400).json({ code: 400, message: '状态不允许' });
    delivery.status = 'delivering';
    await delivery.save();
    res.json({ code: 0, data: delivery });
  } catch (err) {
    next(err);
  }
}

/** 送达完成 */
async function complete(req, res, next) {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ code: 404, message: '配送单不存在' });
    if (delivery.riderId?.toString() !== req.userId.toString()) return res.status(403).json({ code: 403, message: '无权限' });
    if (delivery.status !== 'delivering') return res.status(400).json({ code: 400, message: '请先更新为配送中' });
    delivery.status = 'completed';
    delivery.completedAt = new Date();
    delivery.deliveredAt = delivery.completedAt;
    await delivery.save();
    await Order.updateMany(
      { _id: { $in: delivery.orderIds } },
      { $set: { status: 'completed', deliveredAt: delivery.completedAt, completedAt: delivery.completedAt } }
    );
    const orders = await Order.find({ _id: { $in: delivery.orderIds } }).select('userId orderNo').lean();
    for (const o of orders) {
      await createMessage({
        userId: o.userId,
        type: 'order',
        title: '订单已完成',
        content: `订单 ${o.orderNo} 已送达，感谢您的使用。`,
        relatedId: o._id,
      });
    }
    await User.findByIdAndUpdate(req.userId, { deliveryStatus: 'idle', currentDeliveryId: null });
    res.json({ code: 0, data: delivery });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, listPending, getById, accept, picking, delivering, complete };
