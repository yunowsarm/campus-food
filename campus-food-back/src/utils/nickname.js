/**
 * 生成随机字符串
 * @param {number} length 字符串长度，默认6位
 * @returns {string} 随机字符串
 */
function generateRandomString(length = 6) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成游客昵称
 * @param {string} userId 用户ID，用于生成固定随机字符串（可选）
 * @returns {string} 游客昵称，格式：游客 + 随机字符串
 */
function generateGuestNickname(userId) {
  let randomStr;
  if (userId) {
    // 基于用户ID生成固定随机字符串，确保同一用户每次生成的都一样
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    randomStr = '';
    const absHash = Math.abs(hash);
    for (let i = 0; i < 6; i++) {
      randomStr += chars.charAt((absHash + i) % chars.length);
    }
  } else {
    // 如果没有用户ID，生成真正的随机字符串
    randomStr = generateRandomString(6);
  }
  return `游客${randomStr}`;
}

module.exports = {
  generateRandomString,
  generateGuestNickname,
};
