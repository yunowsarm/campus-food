const Category = require("../models/Category");
//分类列表、创建、更新、删除
async function list(req, res, next) {
  try {
    const { merchantId } = req.query;
    const filter = merchantId
      ? { $or: [{ merchantId }, { merchantId: null }] }
      : {};
    const list = await Category.find(filter).sort({ index: 1 }).lean();
    res.json({ code: 0, data: list });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ code: 0, data: category });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category)
      return res.status(404).json({ code: 404, message: "分类不存在" });
    res.json({ code: 0, data: category });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const r = await Category.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ code: 404, message: "分类不存在" });
    res.json({ code: 0 });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
