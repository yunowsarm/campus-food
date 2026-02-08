const CampusAddress = require("../models/CampusAddress");

/** 获取校园地址列表（配送点选项，按 sort 排序） */
async function list(req, res, next) {
  try {
    const list = await CampusAddress.find().sort({ sort: 1, code: 1 }).lean();
    res.json({ code: 0, data: list });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
