const User = require("../models/User");
const Merchant = require("../models/Merchant");
const Food = require("../models/Food");
const Order = require("../models/Order");
const Review = require("../models/Review");

/** GET /api/admin/users - 用户列表（分页、搜索） */
async function listUsers(req, res, next) {
  try {
    const { page = 1, pageSize = 20, keyword, role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (keyword) {
      filter.$or = [
        { nickName: new RegExp(keyword, "i") },
        { email: new RegExp(keyword, "i") },
      ];
    }
    const skip = (Math.max(1, Number(page)) - 1) * Math.min(50, Number(pageSize));
    const limit = Math.min(50, Math.max(1, Number(pageSize)));
    const [list, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    res.json({
      code: 0,
      data: { list, total, page: Number(page), pageSize: limit },
    });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/users/:id/status - 启用/禁用用户 */
async function setUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "disabled"].includes(status)) {
      return res.status(400).json({ code: 400, message: "status 为 active 或 disabled" });
    }
    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ code: 404, message: "用户不存在" });
    res.json({ code: 0, data: user });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/users/:id/role - 修改用户角色 */
async function setUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["student", "merchant", "delivery", "admin"].includes(role)) {
      return res.status(400).json({ code: 400, message: "无效角色" });
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ code: 404, message: "用户不存在" });
    res.json({ code: 0, data: user });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/merchants/pending - 待审核商家列表 */
async function listPendingMerchants(req, res, next) {
  try {
    const list = await Merchant.find({ auditStatus: "pending" })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ code: 0, data: { list } });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/merchants/:id/approve - 审核通过商家 */
async function approveMerchant(req, res, next) {
  try {
    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      { auditStatus: "approved" },
      { new: true }
    ).lean();
    if (!merchant) return res.status(404).json({ code: 404, message: "商家不存在" });
    res.json({ code: 0, data: merchant });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/merchants/:id/reject - 审核拒绝商家 */
async function rejectMerchant(req, res, next) {
  try {
    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      { auditStatus: "rejected" },
      { new: true }
    ).lean();
    if (!merchant) return res.status(404).json({ code: 404, message: "商家不存在" });
    res.json({ code: 0, data: merchant });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/foods/pending - 待审核美食列表 */
async function listPendingFoods(req, res, next) {
  try {
    const list = await Food.find({ auditStatus: "pending" })
      .populate("merchantId", "name logo")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ code: 0, data: { list } });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/foods/:id/approve - 审核通过美食 */
async function approveFood(req, res, next) {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { auditStatus: "approved" },
      { new: true }
    ).lean();
    if (!food) return res.status(404).json({ code: 404, message: "美食不存在" });
    res.json({ code: 0, data: food });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/foods/:id/reject - 审核拒绝美食 */
async function rejectFood(req, res, next) {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { auditStatus: "rejected" },
      { new: true }
    ).lean();
    if (!food) return res.status(404).json({ code: 404, message: "美食不存在" });
    res.json({ code: 0, data: food });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/reviews/pending - 待审核评价列表 */
async function listPendingReviews(req, res, next) {
  try {
    const list = await Review.find({ status: "pending" })
      .populate("userId", "nickName avatarUrl")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ code: 0, data: { list } });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/reviews/:id/approve - 审核通过评价 */
async function approveReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!review) return res.status(404).json({ code: 404, message: "评价不存在" });
    res.json({ code: 0, data: review });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/reviews/:id/reject - 拒绝/删除违规评价 */
async function rejectReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!review) return res.status(404).json({ code: 404, message: "评价不存在" });
    res.json({ code: 0, data: review });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/stats - 平台数据统计 */
async function getStats(req, res, next) {
  try {
    const [userCount, merchantCount, pendingMerchantCount, orderCount, orderAmount, reviewCount, pendingReviewCount] =
      await Promise.all([
        User.countDocuments({}),
        Merchant.countDocuments({ auditStatus: "approved" }),
        Merchant.countDocuments({ auditStatus: "pending" }),
        Order.countDocuments({ status: { $in: ["paid", "preparing", "delivering", "completed"] } }),
        Order.aggregate([
          { $match: { status: { $in: ["paid", "preparing", "delivering", "completed"] } } },
          { $group: { _id: null, total: { $sum: "$finalPrice" } } },
        ]).then((r) => (r[0] && r[0].total) || 0),
        Review.countDocuments({ status: "approved" }),
        Review.countDocuments({ status: "pending" }),
      ]);
    res.json({
      code: 0,
      data: {
        userCount,
        merchantCount,
        pendingMerchantCount,
        orderCount,
        orderAmount,
        reviewCount,
        pendingReviewCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  setUserStatus,
  setUserRole,
  listPendingMerchants,
  approveMerchant,
  rejectMerchant,
  listPendingFoods,
  approveFood,
  rejectFood,
  listPendingReviews,
  approveReview,
  rejectReview,
  getStats,
};
