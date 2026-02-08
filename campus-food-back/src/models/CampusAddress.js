const mongoose = require("mongoose");

// 校园配送地址/点位（固定选项，供下单时选择）
const campusAddressSchema = new mongoose.Schema(
  {
    code: { type: Number, required: true, unique: true }, // 编号：1、2...
    name: { type: String, required: true }, // 显示名称：男生宿舍1、女生宿舍等
    sort: { type: Number, default: 0 }, // 排序，数字越小越靠前
  },
  { timestamps: true },
);

campusAddressSchema.index({ sort: 1 });

module.exports = mongoose.model("CampusAddress", campusAddressSchema);
