const Address = require('../models/Address');
const User = require('../models/User');
//地址列表、创建、更新、删除
async function list(req, res, next) {
  try {
    const list = await Address.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
    res.json({ code: 0, data: list });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, phone, region, detail, location, isDefault } = req.body;
    const doc = { userId: req.userId, name, phone, region, detail };
    if (location && Array.isArray(location) && location.length >= 2) {
      doc.location = { type: 'Point', coordinates: [Number(location[0]), Number(location[1])] };
    }
    if (isDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
      doc.isDefault = true;
    }
    const address = await Address.create(doc);
    if (doc.isDefault) await User.findByIdAndUpdate(req.userId, { defaultAddressId: address._id });
    res.status(201).json({ code: 0, data: address });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.userId });
    if (!address) return res.status(404).json({ code: 404, message: '地址不存在' });
    const { name, phone, region, detail, location, isDefault } = req.body;
    if (name !== undefined) address.name = name;
    if (phone !== undefined) address.phone = phone;
    if (region !== undefined) address.region = region;
    if (detail !== undefined) address.detail = detail;
    if (location && Array.isArray(location) && location.length >= 2) {
      address.location = { type: 'Point', coordinates: [Number(location[0]), Number(location[1])] };
    }
    if (isDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
      address.isDefault = true;
      await User.findByIdAndUpdate(req.userId, { defaultAddressId: address._id });
    }
    await address.save();
    res.json({ code: 0, data: address });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const r = await Address.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!r) return res.status(404).json({ code: 404, message: '地址不存在' });
    res.json({ code: 0 });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
