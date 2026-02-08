const mongoose = require("mongoose");
// 配送单
const deliverySchema = new mongoose.Schema(
  {
    deliveryNo: { type: String, required: true, unique: true }, // 配送单号
    orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }], // 关联订单（可多单拼单一起送）
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    }, // 商家
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 骑手（配送员）
    pickupAddress: String, // 取餐地址（商家地址）
    pickupLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // 取餐点经纬度
    },
    deliveryAddress: String, // 送达地址
    deliveryLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // 送达点经纬度
    },
    contactName: String, // 联系人
    contactPhone: String, // 联系电话
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "picking",
        "delivering",
        "completed",
        "cancelled",
      ],
      default: "pending",
    }, // 状态：待接单/已接单/取餐中/配送中/已完成/已取消
    fee: { type: Number, default: 0 }, // 配送费（分）
    acceptedAt: Date, // 接单时间
    pickedAt: Date, // 取餐时间
    deliveredAt: Date, // 送达时间
    completedAt: Date, // 完成时间
  },
  { timestamps: true },
);

deliverySchema.index({ riderId: 1, status: 1 });
deliverySchema.index({ merchantId: 1, status: 1 });
deliverySchema.index({ status: 1 });

module.exports = mongoose.model("Delivery", deliverySchema);
