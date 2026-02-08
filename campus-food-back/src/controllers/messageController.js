const Message = require('../models/Message');
//商家列表、详情、创建、更新
async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 10, isRead, type } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const filter = { userId: req.userId };
    if (isRead !== undefined && isRead !== '') filter.isRead = isRead === 'true';
    if (type) filter.type = type;
    const [list, total] = await Promise.all([
      Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)).lean(),
      Message.countDocuments(filter),
    ]);
    res.json({ code: 0, data: { list, total, page: Number(page), pageSize: Number(pageSize) } });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const msg = await Message.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!msg) return res.status(404).json({ code: 404, message: '消息不存在' });
    res.json({ code: 0, data: msg });
  } catch (err) {
    next(err);
  }
}

async function read(req, res, next) {
  try {
    const r = await Message.updateOne({ _id: req.params.id, userId: req.userId }, { isRead: true });
    if (r.matchedCount === 0) return res.status(404).json({ code: 404, message: '消息不存在' });
    res.json({ code: 0 });
  } catch (err) {
    next(err);
  }
}

async function readAll(req, res, next) {
  try {
    await Message.updateMany({ userId: req.userId }, { isRead: true });
    res.json({ code: 0 });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, read, readAll };
