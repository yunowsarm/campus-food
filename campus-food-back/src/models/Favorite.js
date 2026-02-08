const mongoose = require('mongoose');
// 收藏
const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 用户
    targetType: { type: String, enum: ['food', 'merchant'], required: true }, // 收藏类型：菜品/商家
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // 收藏目标 id
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
