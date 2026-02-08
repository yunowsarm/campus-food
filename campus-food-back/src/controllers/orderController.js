const Order = require("../models/Order");
const Delivery = require("../models/Delivery");
const Merchant = require("../models/Merchant");
const Address = require("../models/Address");
const CampusAddress = require("../models/CampusAddress");
const { orderNo } = require("../utils/seqNo");
const { createMessage } = require("../utils/messageHelper");
//下单、订单列表/详情、支付、取消；商家：开始备餐、出餐完成（自取完成或创建配送单）
async function create(req, res, next) {
  try {
    const {
      items,
      deliveryType,
      addressId,
      campusAddressId,
      contactName,
      contactPhone,
      remark,
      groupId,
    } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ code: 400, message: "订单商品不能为空" });
    }
    const Food = require("../models/Food");
    let totalPrice = 0;
    let merchantId = null;
    const orderItems = [];
    for (const it of items) {
      const food = await Food.findById(it.foodId);
      if (!food)
        return res
          .status(400)
          .json({ code: 400, message: `菜品不存在: ${it.foodId}` });
      if (!merchantId) merchantId = food.merchantId;
      const qty = Math.max(1, Number(it.quantity) || 1);
      const price = food.price;
      totalPrice += price * qty;
      orderItems.push({
        foodId: food._id,
        foodName: food.name,
        foodImage: (food.images && food.images[0]) || "",
        price,
        quantity: qty,
        spec: it.spec,
      });
    }
    if (!merchantId)
      return res.status(400).json({ code: 400, message: "无法确定商家" });
    let address = "";
    let contact = contactName || "";
    let phone = contactPhone || "";
    let orderAddressId = undefined;
    if (deliveryType !== "pickup") {
      if (campusAddressId) {
        const campus = await CampusAddress.findById(campusAddressId);
        if (campus) address = campus.name;
      } else if (addressId) {
        const addr = await Address.findOne({
          _id: addressId,
          userId: req.userId,
        });
        if (addr) {
          address = [addr.region, addr.detail].filter(Boolean).join(" ");
          contact = addr.name;
          phone = addr.phone;
          orderAddressId = addr._id;
        }
      }
    }
    const deliveryFee = deliveryType === "pickup" ? 0 : 500;
    const discountAmount = 0;
    const finalPrice = totalPrice + deliveryFee - discountAmount;
    const order = await Order.create({
      orderNo: orderNo(),
      userId: req.userId,
      merchantId,
      items: orderItems,
      totalPrice,
      deliveryFee,
      discountAmount,
      finalPrice,
      deliveryType: deliveryType || "alone",
      addressId: orderAddressId,
      address,
      contactName: contact,
      contactPhone: phone,
      remark,
      groupId: groupId || undefined,
      status: "unpaid",
    });
    const doc = await Order.findById(order._id)
      .populate("merchantId", "name logo")
      .lean();
    res.status(201).json({ code: 0, data: doc });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 10, status, merchantId } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const filter = {};
    if (req.role === "student") filter.userId = req.userId;
    if (req.role === "merchant" && req.user?.merchantId)
      filter.merchantId = req.user.merchantId;
    if (merchantId) filter.merchantId = merchantId;
    if (status) {
      const statuses = String(status)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      filter.status =
        statuses.length > 1 ? { $in: statuses } : statuses[0] || status;
    }
    const [list, total] = await Promise.all([
      Order.find(filter)
        .populate("merchantId", "name logo")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean(),
      Order.countDocuments(filter),
    ]);
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
    const order = await Order.findById(req.params.id)
      .populate("merchantId", "name logo address")
      .populate("deliveryId")
      .lean();
    if (!order)
      return res.status(404).json({ code: 404, message: "订单不存在" });
    if (
      req.role === "student" &&
      order.userId.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({ code: 403, message: "无权限" });
    }
    if (
      req.role === "merchant" &&
      req.user?.merchantId &&
      order.merchantId._id.toString() !== req.user.merchantId.toString()
    ) {
      return res.status(403).json({ code: 403, message: "无权限" });
    }
    res.json({ code: 0, data: order });
  } catch (err) {
    next(err);
  }
}

async function pay(req, res, next) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!order)
      return res.status(404).json({ code: 404, message: "订单不存在" });
    if (order.status !== "unpaid")
      return res.status(400).json({ code: 400, message: "订单状态不允许支付" });
    order.status = "paid";
    order.paidAt = new Date();
    await order.save();

    // 支付成功后累加菜品销量（月售）
    const Food = require("../models/Food");
    for (const item of order.items || []) {
      const foodId = item.foodId?._id || item.foodId;
      const qty = item.quantity || 0;
      if (foodId && qty > 0) {
        await Food.findByIdAndUpdate(foodId, { $inc: { sales: qty } });
      }
    }

    res.json({ code: 0, data: order });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!order)
      return res.status(404).json({ code: 404, message: "订单不存在" });
    if (!["unpaid", "paid"].includes(order.status)) {
      return res.status(400).json({ code: 400, message: "当前状态不可取消" });
    }
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    await order.save();
    res.json({ code: 0, data: order });
  } catch (err) {
    next(err);
  }
}

/** 商家：开始备餐 */
async function startPreparing(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ code: 404, message: "订单不存在" });
    if (order.status !== "paid")
      return res.status(400).json({ code: 400, message: "仅已支付订单可备餐" });
    order.status = "preparing";
    await order.save();
    res.json({ code: 0, data: order });
  } catch (err) {
    next(err);
  }
}

/** 商家：出餐完成（自取则完成，配送则创建配送单） */
async function finishPreparing(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ code: 404, message: "订单不存在" });
    if (order.status !== "preparing")
      return res.status(400).json({ code: 400, message: "订单未在备餐中" });
    order.preparedAt = new Date();
    if (order.deliveryType === "pickup") {
      order.status = "completed";
      order.completedAt = new Date();
      await order.save();
      await createMessage({
        userId: order.userId,
        type: "order",
        title: "订单已完成",
        content: `订单 ${order.orderNo} 已完成（到店自取）`,
        relatedId: order._id,
      });
      return res.json({ code: 0, data: order });
    }
    const { deliveryNo } = require("../utils/seqNo");
    const DeliveryModel = require("../models/Delivery");
    const MerchantModel = require("../models/Merchant");
    const merchant = await MerchantModel.findById(order.merchantId).lean();
    const pickupAddress = merchant ? merchant.address : "";
    const pickupLocation = merchant?.location?.coordinates || [0, 0];
    const delivery = await DeliveryModel.create({
      deliveryNo: deliveryNo(),
      orderIds: [order._id],
      merchantId: order.merchantId,
      pickupAddress,
      pickupLocation: { type: "Point", coordinates: pickupLocation },
      deliveryAddress: order.address,
      deliveryLocation: { type: "Point", coordinates: [0, 0] },
      contactName: order.contactName,
      contactPhone: order.contactPhone,
      status: "pending",
      fee: order.deliveryFee || 0,
    });
    order.deliveryId = delivery._id;
    order.status = "delivering";
    await order.save();
    res.json({ code: 0, data: { order, delivery } });
  } catch (err) {
    next(err);
  }
}

/** 学生：申请退款 */
async function requestRefund(req, res, next) {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!order)
      return res.status(404).json({ code: 404, message: "订单不存在" });
    if (!["paid", "preparing"].includes(order.status)) {
      return res
        .status(400)
        .json({ code: 400, message: "当前状态不可申请退款" });
    }
    if (order.refundStatus && order.refundStatus !== "none") {
      return res.status(400).json({ code: 400, message: "已有退款申请" });
    }
    order.refundReason = (reason || "").trim() || "用户申请退款";
    order.refundStatus = "pending";
    await order.save();
    res.json({ code: 0, data: order });
  } catch (err) {
    next(err);
  }
}

/** 商家/管理员：审核通过退款 */
async function approveRefund(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ code: 404, message: "订单不存在" });
    if (
      req.role === "merchant" &&
      req.user?.merchantId?.toString() !== order.merchantId?.toString()
    ) {
      return res.status(403).json({ code: 403, message: "只能操作本店订单" });
    }
    if (order.refundStatus !== "pending") {
      return res.status(400).json({ code: 400, message: "无待审核的退款" });
    }
    order.refundStatus = "approved";
    order.status = "refunded";
    order.refundedAt = new Date();
    await order.save();
    await createMessage({
      userId: order.userId,
      type: "order",
      title: "退款成功",
      content: `订单 ${order.orderNo} 退款已通过，款项将原路返回。`,
      relatedId: order._id,
    });
    res.json({ code: 0, data: order });
  } catch (err) {
    next(err);
  }
}

/** 商家/管理员：拒绝退款 */
async function rejectRefund(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ code: 404, message: "订单不存在" });
    if (
      req.role === "merchant" &&
      req.user?.merchantId?.toString() !== order.merchantId?.toString()
    ) {
      return res.status(403).json({ code: 403, message: "只能操作本店订单" });
    }
    if (order.refundStatus !== "pending") {
      return res.status(400).json({ code: 400, message: "无待审核的退款" });
    }
    order.refundStatus = "rejected";
    order.refundReason = (order.refundReason || "") + " [已拒绝]";
    await order.save();
    res.json({ code: 0, data: order });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getById,
  pay,
  cancel,
  requestRefund,
  approveRefund,
  rejectRefund,
  startPreparing,
  finishPreparing,
};
