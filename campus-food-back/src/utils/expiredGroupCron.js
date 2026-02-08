const Group = require("../models/Group");
const Order = require("../models/Order");
const { createMessagesForUserIds } = require("./messageHelper");

const INTERVAL_MS = 60 * 1000; // 每分钟

async function checkExpiredGroups() {
  try {
    const now = new Date();
    const expired = await Group.find({
      status: "pending",
      endTime: { $lt: now },
    }).lean();
    const expiredIds = expired.map((g) => g._id);
    if (expiredIds.length) {
      await Group.updateMany(
        { _id: { $in: expiredIds } },
        { status: "failed" }
      );
      await Order.updateMany(
        { groupId: { $in: expiredIds } },
        { $set: { status: "cancelled" } }
      );
    }
    for (const g of expired) {
      const userIds = (g.participants || []).map((p) => p.userId);
      if (userIds.length) {
        await createMessagesForUserIds(userIds, {
          type: "group",
          title: "拼单未成团",
          content: `「${g.foodName}」拼单已截止，人数未满，拼单失败。`,
          relatedId: g._id,
        });
      }
    }
  } catch (err) {
    console.error("expiredGroupCron error:", err);
  }
}

function start() {
  checkExpiredGroups();
  setInterval(checkExpiredGroups, INTERVAL_MS);
}

module.exports = { start, checkExpiredGroups };
