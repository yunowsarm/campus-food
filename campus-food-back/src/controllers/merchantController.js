const Merchant = require("../models/Merchant");
const User = require("../models/User");
const Order = require("../models/Order");
const Food = require("../models/Food");

/** 将商家中的 logo、images 等相对路径转为完整 URL */
function toMerchantWithFullUrls(req, merchant) {
  if (!merchant) return merchant;
  const base = `${req.protocol}://${req.get("host")}`;
  if (merchant.logo && !merchant.logo.startsWith("http")) {
    merchant.logo = merchant.logo.startsWith("/") ? base + merchant.logo : base + "/" + merchant.logo;
  }
  if (Array.isArray(merchant.images) && merchant.images.length) {
    merchant.images = merchant.images.map((img) =>
      img && !img.startsWith("http") ? (img.startsWith("/") ? base + img : base + "/" + img) : img
    );
  }
  return merchant;
}

async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 10, status, category, near } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (near) {
      const [lng, lat] = String(near).split(",").map(Number);
      if (lat != null && lng != null) {
        filter.location = {
          $nearSphere: { $geometry: { type: "Point", coordinates: [lng, lat] } },
        };
      }
    }
    const [list, total] = await Promise.all([
      Merchant.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean(),
      Merchant.countDocuments(filter),
    ]);
    res.json({
      code: 0,
      data: { list, total, page: Number(page), pageSize: Number(pageSize) },
    });
  } catch (err) {
    next(err);
  }
}

/** 当前登录用户的商家（商家角色且已绑定店铺） */
async function getMe(req, res, next) {
  try {
    const userId =
      req.userId && req.userId.toString ? req.userId.toString() : req.userId;
    if (!userId) return res.status(401).json({ code: 401, message: "未登录" });
    const user = await User.findById(userId).select("merchantId").lean();
    if (!user || !user.merchantId) {
      return res
        .status(404)
        .json({ code: 404, message: "尚未创建店铺，请先到店铺设置完善" });
    }
    const merchant = await Merchant.findById(user.merchantId).lean();
    if (!merchant) {
      return res.status(404).json({ code: 404, message: "商家不存在" });
    }
    res.json({ code: 0, data: toMerchantWithFullUrls(req, merchant) });
  } catch (err) {
    if (err.name === "CastError") {
      return res
        .status(404)
        .json({ code: 404, message: "尚未创建店铺，请先到店铺设置完善" });
    }
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const merchant = await Merchant.findById(req.params.id).lean();
    if (!merchant)
      return res.status(404).json({ code: 404, message: "商家不存在" });
    res.json({ code: 0, data: toMerchantWithFullUrls(req, merchant) });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const merchant = await Merchant.create(req.body);
    await User.findByIdAndUpdate(req.userId, { merchantId: merchant._id });
    const data = toMerchantWithFullUrls(
      req,
      merchant.toObject ? merchant.toObject() : merchant
    );
    res.status(201).json({ code: 0, data });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).lean();
    if (!merchant)
      return res.status(404).json({ code: 404, message: "商家不存在" });
    res.json({ code: 0, data: toMerchantWithFullUrls(req, merchant) });
  } catch (err) {
    next(err);
  }
}

/** 商家统计数据：今日/本周/本月订单数、销售额、热销菜品 Top10 */
async function getStats(req, res, next) {
  try {
    const merchantId = req.user?.merchantId;
    if (!merchantId) {
      return res.status(404).json({ code: 404, message: "尚未创建店铺" });
    }
    const { range = "today" } = req.query; // today | week | month
    const now = new Date();
    let start;
    if (range === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.getFullYear(), now.getMonth(), diff);
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const filter = { merchantId, createdAt: { $gte: start } };
    const orders = await Order.find(filter).select("finalPrice status items").lean();
    const orderCount = orders.length;
    const completedOrPaid = orders.filter(
      (o) => ["paid", "preparing", "delivering", "completed"].includes(o.status)
    );
    const sales = completedOrPaid.reduce((sum, o) => sum + (o.finalPrice || 0), 0);
    const avgPrice = orderCount > 0 ? Math.round(sales / orderCount) : 0;
    const statusCounts = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const foodSales = {};
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const fid = it.foodId?.toString?.() || it.foodId;
        if (fid) {
          foodSales[fid] = (foodSales[fid] || 0) + (it.quantity || 0);
        }
      });
    });
    const topFoodIds = Object.entries(foodSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);
    const hotFoods = await Food.find({ _id: { $in: topFoodIds } })
      .select("name sales")
      .lean();
    const hotMap = Object.fromEntries(hotFoods.map((f) => [f._id.toString(), f]));
    const hotList = topFoodIds.map((id) => ({
      id: id,
      name: hotMap[id]?.name || "未知",
      sales: foodSales[id] || 0,
    }));
    res.json({
      code: 0,
      data: {
        orderCount,
        sales,
        avgPrice,
        statusCounts,
        hotFoods: hotList,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getMe, getById, create, update, getStats };
