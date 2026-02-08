const mongoose = require("mongoose");
// 拼单参与人
const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // 用户
    nickName: String, // 昵称
    avatarUrl: String, // 头像
    joinTime: { type: Date, default: Date.now }, // 参与时间
    deliveryType: String, // 配送方式
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" }, // 收货地址
    address: String, // 收货地址（冗余）
    contactName: String, // 联系人
    contactPhone: String, // 联系电话
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // 成团后生成的订单
  },
  { _id: true }
);

// 拼单
const groupSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    }, // 菜品
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    }, // 商家
    foodName: String, // 菜品名称
    foodImage: String, // 菜品图片
    price: { type: Number, required: true }, // 拼单单价（分）
    originalPrice: Number, // 原价（分）
    targetNum: { type: Number, required: true }, // 成团人数
    deliveryType: {
      type: String,
      enum: ["alone", "together", "pickup"],
      required: true,
    }, // 配送方式：单独送/一起送/自取
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // 发起人
    creatorName: String, // 发起人昵称
    creatorAvatar: String, // 发起人头像
    participants: [participantSchema], // 参与人列表
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "pending",
    }, // 状态：进行中/成团/失败/已取消
    endTime: { type: Date, required: true }, // 截止时间
    successAt: Date, // 成团时间
  },
  { timestamps: true }
);

groupSchema.index({ status: 1, endTime: 1 });
groupSchema.index({ foodId: 1, merchantId: 1 });
groupSchema.index({ creatorId: 1 });

module.exports = mongoose.model("Group", groupSchema);
