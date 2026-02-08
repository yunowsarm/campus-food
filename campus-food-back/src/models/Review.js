const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["food", "merchant"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },
    targetModel: {
      type: String,
      enum: ["Food", "Merchant"],
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, default: "" },
    images: [String],
    reply: { type: String },
    replyAt: Date,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1 });
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ orderId: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
