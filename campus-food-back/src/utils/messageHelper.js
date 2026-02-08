const Message = require("../models/Message");

/**
 * 创建消息通知
 * @param {Object} opts - { userId, type: 'order'|'group'|'delivery'|'system', title, content, relatedId }
 */
async function createMessage(opts) {
  const { userId, type, title, content, relatedId } = opts;
  if (!userId || !type) return null;
  try {
    const msg = await Message.create({
      userId,
      type,
      title: title || "",
      content: content || "",
      relatedId: relatedId || undefined,
    });
    return msg;
  } catch (err) {
    console.error("createMessage error:", err);
    return null;
  }
}

/**
 * 批量创建消息（拼单成功/失败时通知所有参与者）
 */
async function createMessagesForUserIds(userIds, opts) {
  const { type, title, content, relatedId } = opts;
  if (!userIds || !userIds.length || !type) return;
  const ids = [...new Set(userIds.map((id) => id && id.toString()).filter(Boolean))];
  await Promise.all(
    ids.map((uid) => createMessage({ userId: uid, type, title, content, relatedId }))
  );
}

module.exports = { createMessage, createMessagesForUserIds };
