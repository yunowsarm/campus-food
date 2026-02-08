const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");

async function list(req, res, next) {
  try {
    const { targetType } = req.query;
    const filter = { userId: req.userId };
    if (targetType) filter.targetType = targetType;
    const list = await Favorite.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ code: 0, data: list });
  } catch (err) {
    next(err);
  }
}

async function toggle(req, res, next) {
  try {
    const { targetType, targetId } = req.body;
    if (!["food", "merchant"].includes(targetType) || !targetId) {
      return res
        .status(400)
        .json({ code: 400, message: "targetType 与 targetId 必填" });
    }
    const tid = mongoose.Types.ObjectId.isValid(targetId)
      ? new mongoose.Types.ObjectId(targetId)
      : targetId;
    const exist = await Favorite.findOne({
      userId: req.userId,
      targetType,
      targetId: tid,
    });
    if (exist) {
      await Favorite.findByIdAndDelete(exist._id);
      return res.json({ code: 0, data: { isFavorite: false } });
    }
    try {
      await Favorite.create({ userId: req.userId, targetType, targetId: tid });
    } catch (e) {
      if (e.code === 11000) {
        return res.json({ code: 0, data: { isFavorite: true } });
      }
      throw e;
    }
    res.json({ code: 0, data: { isFavorite: true } });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, toggle };
