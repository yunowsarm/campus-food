const Review = require("../models/Review");
const Food = require("../models/Food");
const Merchant = require("../models/Merchant");
const Order = require("../models/Order");

function toReviewItem(doc) {
  const r = doc.toObject ? doc.toObject() : doc;
  const id = r._id;
  return {
    id,
    userId: r.userId?._id || r.userId,
    targetType: r.targetType,
    targetId: r.targetId?._id || r.targetId,
    orderId: r.orderId,
    rating: r.rating,
    content: r.content,
    images: r.images || [],
    reply: r.reply,
    replyAt: r.replyAt,
    status: r.status,
    likeCount: r.likeCount || 0,
    createdAt: r.createdAt,
    user: r.user || (r.userId && typeof r.userId === 'object' ? { nickName: r.userId.nickName, avatarUrl: r.userId.avatarUrl } : null),
    targetName: r.targetName,
    targetImage: r.targetImage,
  };
}

async function updateTargetRating(targetType, targetId) {
  const filter = { targetType, targetId, status: "approved" };
  const list = await Review.find(filter).select("rating");
  const n = list.length;
  if (n === 0) {
    const update = { rating: 0, ratingCount: 0 };
    if (targetType === "food") await Food.findByIdAndUpdate(targetId, update);
    else await Merchant.findByIdAndUpdate(targetId, update);
    return;
  }
  const sum = list.reduce((a, b) => a + b.rating, 0);
  const rating = Math.round((sum / n) * 10) / 10;
  const update = { rating, ratingCount: n };
  if (targetType === "food") await Food.findByIdAndUpdate(targetId, update);
  else await Merchant.findByIdAndUpdate(targetId, update);
}

/**
 * POST /api/reviews - 提交评价（学生，订单完成后）
 */
async function create(req, res, next) {
  try {
    const { orderId, targetType, targetId, rating, content, images } = req.body;
    const userId = req.userId;
    if (!orderId || !targetType || !targetId || !rating) {
      return res.status(400).json({ code: 400, message: "缺少必填参数" });
    }
    if (!["food", "merchant"].includes(targetType)) {
      return res.status(400).json({ code: 400, message: "targetType 为 food 或 merchant" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ code: 400, message: "评分为 1-5 星" });
    }
    const order = await Order.findOne({
      _id: orderId,
      userId,
      status: "completed",
    });
    if (!order) {
      return res.status(400).json({ code: 400, message: "订单不存在或未完成" });
    }
    const targetModel = targetType === "food" ? "Food" : "Merchant";
    const exists = await Review.findOne({ orderId, targetType, targetId });
    if (exists) {
      return res.status(400).json({ code: 400, message: "该订单已评价过" });
    }
    const review = await Review.create({
      userId,
      targetType,
      targetId,
      targetModel,
      orderId,
      rating: Number(rating),
      content: (content || "").trim(),
      images: Array.isArray(images) ? images : [],
    });
    await updateTargetRating(targetType, targetId);
    res.status(201).json({ code: 0, data: toReviewItem(review) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reviews - 评价列表（支持 targetType、targetId 筛选）
 */
async function list(req, res, next) {
  try {
    const { targetType, targetId, page = 1, pageSize = 20 } = req.query;
    const filter = { status: "approved" };
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, Math.max(1, parseInt(pageSize, 10)));
    const limit = Math.min(50, Math.max(1, parseInt(pageSize, 10)));
    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "nickName avatarUrl"),
      Review.countDocuments(filter),
    ]);
    const list = items.map((d) => {
      const r = d.toObject();
      r.user = r.userId ? { nickName: r.userId.nickName, avatarUrl: r.userId.avatarUrl } : null;
      delete r.userId;
      return toReviewItem(r);
    });
    res.json({
      code: 0,
      data: { list, total, page: parseInt(page, 10), pageSize: limit },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/foods/:id/reviews - 美食评价列表（在 foods 路由挂载）
 */
async function listByFood(req, res, next) {
  try {
    const foodId = req.params.id;
    const { page = 1, pageSize = 20 } = req.query;
    const filter = { targetType: "food", targetId: foodId, status: "approved" };
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, Math.max(1, parseInt(pageSize, 10)));
    const limit = Math.min(50, Math.max(1, parseInt(pageSize, 10)));
    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "nickName avatarUrl"),
      Review.countDocuments(filter),
    ]);
    const list = items.map((d) => {
      const r = d.toObject();
      r.user = r.userId ? { nickName: r.userId.nickName, avatarUrl: r.userId.avatarUrl } : null;
      delete r.userId;
      return toReviewItem(r);
    });
    res.json({
      code: 0,
      data: { list, total, page: parseInt(page, 10), pageSize: limit },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reviews/hot - 热门评价
 */
async function getHot(req, res, next) {
  try {
    const { limit = 10 } = req.query;
    const n = Math.min(20, Math.max(1, parseInt(limit, 10)));
    const items = await Review.find({ status: "approved" })
      .sort({ likeCount: -1, createdAt: -1 })
      .limit(n)
      .populate("userId", "nickName avatarUrl")
      .populate("targetId", "name images");
    const list = items.map((d) => {
      const r = d.toObject();
      r.user = r.userId ? { nickName: r.userId.nickName, avatarUrl: r.userId.avatarUrl } : null;
      r.targetName = r.targetId?.name;
      r.targetImage = r.targetId?.images?.[0];
      delete r.userId;
      delete r.targetId;
      return toReviewItem(r);
    });
    res.json({ code: 0, data: { list } });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/reviews/:id/reply - 商家回复评价
 */
async function reply(req, res, next) {
  try {
    const { id } = req.params;
    const { reply: replyText } = req.body;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ code: 404, message: "评价不存在" });
    const merchantId = req.user?.merchantId?.toString();
    if (review.targetType === "merchant") {
      if (merchantId !== review.targetId?.toString()) {
        return res.status(403).json({ code: 403, message: "只能回复本店评价" });
      }
    } else {
      const food = await Food.findById(review.targetId).select("merchantId");
      if (!food || food.merchantId?.toString() !== merchantId) {
        return res.status(403).json({ code: 403, message: "只能回复本店菜品评价" });
      }
    }
    review.reply = (replyText || "").trim();
    review.replyAt = new Date();
    await review.save();
    res.json({ code: 0, data: toReviewItem(review) });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/reviews/:id/status - 审核评价（管理员）
 */
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ code: 400, message: "status 为 approved 或 rejected" });
    }
    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!review) return res.status(404).json({ code: 404, message: "评价不存在" });
    if (status === "rejected") {
      await updateTargetRating(review.targetType, review.targetId);
    } else {
      await updateTargetRating(review.targetType, review.targetId);
    }
    res.json({ code: 0, data: toReviewItem(review) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  listByFood,
  getHot,
  reply,
  updateStatus,
};
