const Food = require("../models/Food");
const Favorite = require("../models/Favorite");
const User = require("../models/User");
const Order = require("../models/Order");

/** GET /api/foods/recommendations - 个性化推荐（基于收藏、订单历史、热度） */
async function getRecommendations(req, res, next) {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const limit = Math.min(50, Math.max(1, Number(pageSize)));
    const skip = (Math.max(1, Number(page)) - 1) * limit;
    const userId = req.userId;

    let preferredCategoryIds = [];
    let seenFoodIds = new Set();

    if (userId) {
      const [favs, orders] = await Promise.all([
        Favorite.find({ userId, targetType: "food" }).select("targetId").lean(),
        Order.find({ userId, status: "completed" })
          .select("items.foodId")
          .lean(),
      ]);
      const favFoodIds = favs.map((f) => f.targetId);
      const orderFoodIds = orders.flatMap((o) => (o.items || []).map((i) => i.foodId).filter(Boolean));
      const allIds = [...new Set([...favFoodIds, ...orderFoodIds].map(String))];
      seenFoodIds = new Set(allIds);
      if (allIds.length > 0) {
        const preferredFoods = await Food.find({ _id: { $in: allIds.slice(0, 20) } })
          .select("categoryId")
          .lean();
        preferredCategoryIds = [...new Set(preferredFoods.map((f) => f.categoryId).filter(Boolean).map(String))];
      }
    }

    const filter = { status: "on" };
    const sort = [
      { rating: -1, ratingCount: -1 },
      { sales: -1 },
      { createdAt: -1 },
    ];

    let list = [];
    const totalToFetch = limit + 50;

    if (preferredCategoryIds.length > 0) {
      const excludeIds = [...seenFoodIds].slice(0, 100);
      const personalized = await Food.find({
        ...filter,
        categoryId: { $in: preferredCategoryIds },
        ...(excludeIds.length ? { _id: { $nin: excludeIds } } : {}),
      })
        .populate("merchantId", "name logo")
        .sort(sort[0])
        .limit(Math.ceil(totalToFetch * 0.6))
        .skip(0)
        .lean();
      list = personalized;
      personalized.forEach((f) => seenFoodIds.add(f._id.toString()));
    }

    const hotCount = Math.ceil(totalToFetch * 0.3);
    const hot = await Food.find({
      ...filter,
      _id: { $nin: list.map((f) => f._id) },
    })
      .populate("merchantId", "name logo")
      .sort({ rating: -1, ratingCount: -1, sales: -1 })
      .limit(hotCount)
      .lean();
    hot.forEach((f) => {
      if (!list.find((x) => x._id.toString() === f._id.toString())) list.push(f);
    });

    const need = totalToFetch - list.length;
    if (need > 0) {
      const more = await Food.find({
        ...filter,
        _id: { $nin: list.map((f) => f._id) },
      })
        .populate("merchantId", "name logo")
        .sort({ createdAt: -1 })
        .limit(need)
        .lean();
      more.forEach((f) => {
        if (!list.find((x) => x._id.toString() === f._id.toString())) list.push(f);
      });
    }

    if (userId) {
      const favs = await Favorite.find({ userId, targetType: "food" }).select("targetId").lean();
      const favSet = new Set(favs.map((f) => f.targetId.toString()));
      list.forEach((f) => {
        f.isFavorite = favSet.has(f._id.toString());
      });
    }

    const total = list.length;
    const pageNum = Math.max(1, Number(page));
    const sliced = list.slice(skip, skip + limit);

    res.json({
      code: 0,
      data: { list: sliced, total, page: pageNum, pageSize: limit },
    });
  } catch (err) {
    next(err);
  }
}

// 菜品列表：默认只返回上架；商家查自己店铺时返回全部状态
async function list(req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 10,
      categoryId,
      merchantId,
      keyword,
    } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const filter = { status: "on" };
    // 避免 query 里传来字符串 "undefined" 导致 CastError
    if (categoryId && categoryId !== "undefined")
      filter.categoryId = categoryId;
    if (merchantId && merchantId !== "undefined")
      filter.merchantId = merchantId;
    if (keyword) filter.name = new RegExp(keyword, "i");
    // 商家查自己店铺时返回全部（含下架）
    if (merchantId && req.userId) {
      const user = await User.findById(req.userId).select("merchantId").lean();
      if (user?.merchantId && String(user.merchantId) === String(merchantId))
        delete filter.status;
    }
    const [list, total] = await Promise.all([
      Food.find(filter)
        .populate("merchantId", "name logo")
        .sort({ sort: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean(),
      Food.countDocuments(filter),
    ]);
    if (req.userId) {
      const favs = await Favorite.find({
        userId: req.userId,
        targetType: "food",
      })
        .select("targetId")
        .lean();
      const favSet = new Set(favs.map((f) => f.targetId.toString()));
      list.forEach((f) => {
        f.isFavorite = favSet.has(f._id.toString());
      });
    }
    res.json({
      code: 0,
      data: { list, total, page: Number(page), pageSize: Number(pageSize) },
    });
  } catch (err) {
    next(err);
  }
}

function isValidObjectId(id) {
  return id && id !== "undefined" && /^[a-f0-9A-F]{24}$/.test(id);
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id))
      return res.status(404).json({ code: 404, message: "菜品不存在" });
    const food = await Food.findById(id)
      .populate("merchantId", "name logo address description")
      .lean();
    if (!food)
      return res.status(404).json({ code: 404, message: "菜品不存在" });
    if (req.userId) {
      const fav = await Favorite.findOne({
        userId: req.userId,
        targetType: "food",
        targetId: food._id,
      });
      food.isFavorite = !!fav;
    }
    res.json({ code: 0, data: food });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({ code: 0, data: food });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!food)
      return res.status(404).json({ code: 404, message: "菜品不存在" });
    res.json({ code: 0, data: food });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const r = await Food.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ code: 404, message: "菜品不存在" });
    res.json({ code: 0 });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getRecommendations, getById, create, update, remove };
