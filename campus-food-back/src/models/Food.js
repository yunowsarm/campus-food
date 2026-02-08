const mongoose = require('mongoose');
// 菜品
const foodSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true }, // 所属商家
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // 所属分类
    name: { type: String, required: true }, // 菜品名称
    description: String, // 描述
    images: [String], // 图片列表
    price: { type: Number, required: true }, // 价格（分）
    originalPrice: Number, // 原价（分）
    stock: { type: Number, default: 0 }, // 库存
    sales: { type: Number, default: 0 }, // 销量
    rating: { type: Number, default: 0 }, // 评分
    ratingCount: { type: Number, default: 0 }, // 评价数
    tags: [String], // 标签（如热销、推荐）
    groupPrice: Number, // 拼单价（分）
    minGroupNum: Number, // 最少成团人数
    status: { type: String, enum: ['on', 'off'], default: 'on' }, // 上架状态
    auditStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }, // 内容审核状态
    sort: { type: Number, default: 0 }, // 排序
  },
  { timestamps: true }
);

foodSchema.index({ merchantId: 1, status: 1 });
foodSchema.index({ categoryId: 1 });
foodSchema.index({ merchantId: 1, status: 1, sort: 1 });

module.exports = mongoose.model('Food', foodSchema);
