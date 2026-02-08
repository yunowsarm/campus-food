const mongoose = require("mongoose");
// 用户（邮箱注册/登录 或 微信授权登录）
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    openId: { type: String }, // 微信 openId，唯一索引见 schema.index
    unionId: { type: String },
    nickName: { type: String, default: "微信用户" },
    avatarUrl: String,
    phone: String,
    role: {
      type: String,
      enum: ["student", "merchant", "delivery", "admin"],
    }, // 主角色：学生/商家/配送员/管理员
    defaultAddressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" }, // 默认收货地址
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant" }, // 关联商家（商家角色时）
    deliveryStatus: {
      type: String,
      enum: ["idle", "busy", "offline"],
      default: "idle",
    }, // 配送状态：空闲/忙碌/离线
    currentDeliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
    }, // 当前配送单
    status: { type: String, enum: ["active", "disabled"], default: "active" }, // 账号状态
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ merchantId: 1 });
userSchema.index({ deliveryStatus: 1 });
userSchema.index({ openId: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
