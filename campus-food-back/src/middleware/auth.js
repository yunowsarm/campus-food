const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "campus-food-secret";

/**
 * 签发 token（登录/注册后调用）
 */
function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * 认证中间件：要求已登录
 */
async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
    if (!token) {
      return res.status(401).json({ code: 401, message: "未登录" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== "active") {
      return res.status(401).json({ code: 401, message: "用户不存在或已禁用" });
    }
    req.user = user;
    req.userId = user._id;
    req.role = user.role;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ code: 401, message: "登录已过期" });
    }
    return res.status(401).json({ code: 401, message: "无效 token" });
  }
}

/**
 * 可选认证：有 token 则解析并挂载 user，无 token 不报错
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
    if (!token) return next();
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user && user.status === "active") {
      req.user = user;
      req.userId = user._id;
      req.role = user.role;
    }
    next();
  } catch (e) {
    next();
  }
}

/**
 * 角色校验：仅允许指定角色
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ code: 401, message: "未登录" });
    const list = allowedRoles.length
      ? allowedRoles
      : ["student", "merchant", "delivery", "admin"];
    if (!list.includes(req.role)) {
      return res.status(403).json({ code: 403, message: "无权限" });
    }
    next();
  };
}

function requireAdmin(req, res, next) {
  if (!req.user)
    return res.status(401).json({ code: 401, message: "未登录" });
  if (req.role !== "admin") {
    return res.status(403).json({ code: 403, message: "需要管理员权限" });
  }
  next();
}

module.exports = { signToken, auth, optionalAuth, requireRole, requireAdmin };
