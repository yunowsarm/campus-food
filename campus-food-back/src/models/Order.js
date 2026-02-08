const mongoose = require("mongoose");
// 订单项
const orderItemSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    }, // 菜品
    foodName: String, // 菜品名称
    foodImage: String, // 菜品图片
    price: { type: Number, required: true }, // 单价（分）
    quantity: { type: Number, required: true }, // 数量
    spec: String, // 规格
  },
  { _id: true }
);

// 订单
const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true }, // 订单号
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // 下单用户（学生）
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    }, // 商家
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" }, // 配送单（配送时）
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // 拼单（来自拼单时）
    items: [orderItemSchema], // 订单项
    totalPrice: { type: Number, required: true }, // 商品总价（分）
    deliveryFee: { type: Number, default: 0 }, // 配送费（分）
    discountAmount: { type: Number, default: 0 }, // 优惠金额（分）
    finalPrice: { type: Number, required: true }, // 实付（分）
    deliveryType: {
      type: String,
      enum: ["alone", "together", "pickup"],
      required: true,
    }, // 配送方式：单独送/拼单送/自取
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" }, // 收货地址
    address: String, // 收货地址（冗余）
    contactName: String, // 联系人
    contactPhone: String, // 联系电话
    remark: String, // 备注
    status: {
      type: String,
      enum: [
        "pending_group", // 等待成团（拼单）
        "unpaid",
        "paid",
        "preparing",
        "delivering",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "unpaid",
    }, // 状态：等待成团/未支付/已支付/备餐中/配送中/已完成/已取消/已退款
    paidAt: Date, // 支付时间
    preparedAt: Date, // 出餐完成时间
    deliveredAt: Date, // 送达时间
    completedAt: Date, // 完成时间
    cancelledAt: Date, // 取消时间
    cancelReason: String, // 取消原因
    refundReason: String, // 退款原因
    refundStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    }, // 退款状态
    refundedAt: Date, // 退款时间
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ merchantId: 1, status: 1, createdAt: -1 });
orderSchema.index({ deliveryId: 1 });
orderSchema.index({ groupId: 1 });

module.exports = mongoose.model("Order", orderSchema);
