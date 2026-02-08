const mongoose = require('mongoose');
// 收货地址
const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 用户
    name: { type: String, required: true }, // 收货人姓名
    phone: { type: String, required: true }, // 手机号
    region: String, // 省市区
    detail: String, // 详细地址
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // 经纬度
    },
    isDefault: { type: Boolean, default: false }, // 是否默认地址
  },
  { timestamps: true }
);

addressSchema.index({ userId: 1 });

module.exports = mongoose.model('Address', addressSchema);
