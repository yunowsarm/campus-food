const Group = require("../models/Group");
const Food = require("../models/Food");
const Order = require("../models/Order");
const Address = require("../models/Address");
const CampusAddress = require("../models/CampusAddress");
const User = require("../models/User");
const { createMessagesForUserIds } = require("../utils/messageHelper");
const { orderNo } = require("../utils/seqNo");
//拼单列表、详情、发起、参与、取消
async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 10, status, deliveryType } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const filter = {};
    if (status) filter.status = status;
    if (deliveryType) filter.deliveryType = deliveryType;
    const [list, total] = await Promise.all([
      Group.find(filter)
        .populate("foodId", "name images")
        .populate("merchantId", "name logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean(),
      Group.countDocuments(filter),
    ]);
    list.forEach((g) => {
      g.remainingTime = Math.max(
        0,
        Math.floor((new Date(g.endTime) - new Date()) / 1000)
      );
      g.currentNum = (g.participants || []).length;
    });
    res.json({
      code: 0,
      data: { list, total, page: Number(page), pageSize: Number(pageSize) },
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ code: 400, message: "拼单ID无效" });
    }
    const group = await Group.findById(id)
      .populate("foodId", "name images description merchantId")
      .populate("merchantId", "name logo address")
      .lean();
    if (!group)
      return res.status(404).json({ code: 404, message: "拼单不存在" });
    group.remainingTime = Math.max(
      0,
      Math.floor((new Date(group.endTime) - new Date()) / 1000)
    );
    group.currentNum = (group.participants || []).length;
    if (group.foodId?.merchantId)
      group.food = { ...group.foodId, merchantId: group.foodId.merchantId };
    res.json({ code: 0, data: group });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { foodId, targetNum, deliveryType, endTime, campusAddressId, creatorOrderId } =
      req.body;
    const food = await Food.findById(foodId);
    if (!food)
      return res.status(404).json({ code: 404, message: "菜品不存在" });
    const needAddress =
      deliveryType === "alone" || deliveryType === "together";
    if (needAddress && !campusAddressId) {
      return res
        .status(400)
        .json({ code: 400, message: "请选择配送地址" });
    }
    let creatorAddress = "";
    if (needAddress && campusAddressId) {
      const campus = await CampusAddress.findById(campusAddressId);
      if (campus) creatorAddress = campus.name;
    }
    const user = await User.findById(req.userId)
      .select("nickName avatarUrl phone")
      .lean();
    const price = food.groupPrice || food.price;
    const g = await Group.create({
      foodId: food._id,
      merchantId: food.merchantId,
      foodName: food.name,
      foodImage: (food.images && food.images[0]) || "",
      price,
      originalPrice: food.price,
      targetNum: targetNum || 2,
      deliveryType: deliveryType || "together",
      creatorId: req.userId,
      creatorName: (user && user.nickName) || "",
      creatorAvatar: (user && user.avatarUrl) || "",
      participants: [
        {
          userId: req.userId,
          nickName: user?.nickName,
          avatarUrl: user?.avatarUrl,
          joinTime: new Date(),
          deliveryType: deliveryType || "together",
          address: creatorAddress,
        },
      ],
      status: "pending",
      endTime: endTime || new Date(Date.now() + 3600 * 1000),
    });
    if (creatorOrderId) {
      const creatorOrder = await Order.findOne({
        _id: creatorOrderId,
        userId: req.userId,
      });
      if (!creatorOrder)
        return res.status(400).json({ code: 400, message: "团长订单不存在或无权使用" });
      creatorOrder.groupId = g._id;
      creatorOrder.status = "pending_group";
      await creatorOrder.save();
      g.participants[0].orderId = creatorOrder._id;
      await g.save();
    } else {
      const creatorOrder = await Order.create({
        orderNo: orderNo(Math.floor(Math.random() * 10000)),
        userId: req.userId,
        merchantId: food.merchantId,
        groupId: g._id,
        items: [
          {
            foodId: food._id,
            foodName: food.name,
            foodImage: (food.images && food.images[0]) || "",
            price,
            quantity: 1,
          },
        ],
        totalPrice: price,
        deliveryFee: 0,
        discountAmount: 0,
        finalPrice: price,
        deliveryType: deliveryType || "together",
        address: creatorAddress,
        contactName: user?.nickName || "",
        contactPhone: user?.phone || "",
        status: "pending_group",
      });
      g.participants[0].orderId = creatorOrder._id;
      await g.save();
    }
    const doc = await Group.findById(g._id)
      .populate("foodId")
      .populate("merchantId", "name logo")
      .lean();
    doc.remainingTime = Math.max(
      0,
      Math.floor((new Date(doc.endTime) - new Date()) / 1000)
    );
    doc.currentNum = (doc.participants || []).length;
    res.status(201).json({ code: 0, data: doc });
  } catch (err) {
    next(err);
  }
}

async function join(req, res, next) {
  try {
    const { deliveryType, campusAddressId, addressId, contactName, contactPhone } =
      req.body;
    const group = await Group.findById(req.params.id);
    if (!group)
      return res.status(404).json({ code: 404, message: "拼单不存在" });
    if (group.status !== "pending")
      return res.status(400).json({ code: 400, message: "拼单已结束" });
    if (new Date() > new Date(group.endTime))
      return res.status(400).json({ code: 400, message: "拼单已过期" });
    const exists = group.participants.some(
      (p) => p.userId.toString() === req.userId.toString()
    );
    if (exists)
      return res.status(400).json({ code: 400, message: "已参与该拼单" });
    if (group.participants.length >= group.targetNum)
      return res.status(400).json({ code: 400, message: "人数已满" });
    const groupDeliveryType = group.deliveryType;
    // 单独配送时必须传校园配送点
    if (groupDeliveryType === "alone" && !campusAddressId) {
      return res
        .status(400)
        .json({ code: 400, message: "请选择配送地址" });
    }
    const user = await User.findById(req.userId)
      .select("nickName avatarUrl phone")
      .lean();
    let address = "";
    let contact = contactName || user?.nickName || "";
    let phone = contactPhone || user?.phone || "";
    if (groupDeliveryType === "together") {
      // 集体配送：使用团长（第一个参与者）地址
      const creator = group.participants[0];
      if (creator && creator.address) {
        address = creator.address;
      }
    } else if (groupDeliveryType === "alone" && campusAddressId) {
      const campus = await CampusAddress.findById(campusAddressId);
      if (campus) address = campus.name;
    }
    // 兼容旧版：用户地址表 addressId
    if (!address && addressId) {
      const addr = await Address.findOne({
        _id: addressId,
        userId: req.userId,
      });
      if (addr) {
        address = [addr.region, addr.detail].filter(Boolean).join(" ");
        contact = addr.name;
        phone = addr.phone;
      }
    }
    const joinerOrder = await Order.create({
      orderNo: orderNo(Math.floor(Math.random() * 10000)),
      userId: req.userId,
      merchantId: group.merchantId,
      groupId: group._id,
      items: [
        {
          foodId: group.foodId,
          foodName: group.foodName,
          foodImage: group.foodImage || "",
          price: group.price,
          quantity: 1,
        },
      ],
      totalPrice: group.price,
      deliveryFee: 0,
      discountAmount: 0,
      finalPrice: group.price,
      deliveryType: groupDeliveryType || "together",
      address: address || "",
      contactName: contact,
      contactPhone: phone,
      status: "pending_group",
    });
    group.participants.push({
      userId: req.userId,
      nickName: user?.nickName,
      avatarUrl: user?.avatarUrl,
      joinTime: new Date(),
      deliveryType: groupDeliveryType || "together",
      addressId: addressId || undefined,
      address,
      contactName: contact,
      contactPhone: phone,
      orderId: joinerOrder._id,
    });
    const isSuccess = group.participants.length >= group.targetNum;
    if (isSuccess) {
      group.status = "success";
      group.successAt = new Date();
      await Order.updateMany(
        { groupId: group._id },
        { $set: { status: "unpaid" } }
      );
      const userIds = group.participants.map((p) => p.userId);
      await createMessagesForUserIds(userIds, {
        type: "group",
        title: "拼单成功",
        content: `「${group.foodName}」拼单已成团，请尽快完成支付。`,
        relatedId: group._id,
      });
    }
    await group.save();
    const doc = await Group.findById(group._id)
      .populate("foodId")
      .populate("merchantId", "name logo")
      .lean();
    doc.remainingTime = Math.max(
      0,
      Math.floor((new Date(doc.endTime) - new Date()) / 1000)
    );
    doc.currentNum = (doc.participants || []).length;
    res.json({ code: 0, data: doc });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group)
      return res.status(404).json({ code: 404, message: "拼单不存在" });
    if (group.status !== "pending")
      return res.status(400).json({ code: 400, message: "拼单已结束" });
    if (group.creatorId.toString() !== req.userId.toString()) {
      return res.status(403).json({ code: 403, message: "仅发起人可取消" });
    }
    group.status = "cancelled";
    await group.save();
    await Order.updateMany(
      { groupId: req.params.id },
      { $set: { status: "cancelled" } }
    );
    const userIds = group.participants.map((p) => p.userId);
    await createMessagesForUserIds(userIds, {
      type: "group",
      title: "拼单已取消",
      content: `「${group.foodName}」拼单已被发起人取消。`,
      relatedId: group._id,
    });
    res.json({ code: 0, data: group });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, join, cancel };
