const mongoose = require('mongoose');
// 商家/店铺
const merchantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // 店铺名称
    logo: String, // 店铺 logo
    images: [String], // 店铺图片
    description: String, // 简介
    category: String, // 经营类目（如川菜、快餐）
    address: String, // 地址
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // 经纬度 [经度, 纬度]
    },
    contactName: String, // 联系人
    contactPhone: String, // 联系电话
    businessHours: String, // 营业时间（如 9:00-22:00）
    salesCount: { type: Number, default: 0 }, // 销量
    rating: { type: Number, default: 0 }, // 评分
    ratingCount: { type: Number, default: 0 }, // 评价数
    status: { type: String, enum: ['open', 'closed', 'rest'], default: 'open' }, // 营业状态：营业/打烊/休息
    auditStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }, // 入驻审核状态
  },
  { timestamps: true }
);

merchantSchema.index({ status: 1 });
merchantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Merchant', merchantSchema);
