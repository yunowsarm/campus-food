const mongoose = require("mongoose");
// 菜品分类
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // 分类名称
    icon: String, // 图标
    index: { type: Number }, // 排序序号，数字越小越靠前
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      default: null,
    }, // 所属商家（null 为平台统一分类）
  },
  { timestamps: true },
);

categorySchema.index({ merchantId: 1, index: 1 });

module.exports = mongoose.model("Category", categorySchema);
