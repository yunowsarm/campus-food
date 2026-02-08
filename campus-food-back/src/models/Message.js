const mongoose = require('mongoose');
// 消息/通知
const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 接收用户
    type: { type: String, enum: ['order', 'group', 'delivery', 'system'], required: true }, // 类型：订单/拼单/配送/系统
    title: String, // 标题
    content: String, // 内容
    relatedId: mongoose.Schema.Types.ObjectId, // 关联 id（订单/拼单/配送单）
    isRead: { type: Boolean, default: false }, // 是否已读
  },
  { timestamps: true }
);

messageSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
