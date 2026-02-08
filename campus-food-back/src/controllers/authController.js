const bcrypt = require("bcryptjs");
const axios = require("axios");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");
const {
  setVerificationCode,
  getVerificationCode,
  deleteVerificationCode,
  CODE_EXPIRE,
} = require("../utils/redis");
const { sendVerificationCode: sendEmail } = require("../services/emailService");

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LEN = 6;
const CODE_LEN = 6;

function toUserResponse(user) {
  return {
    id: user._id,
    nickName: user.nickName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    phone: user.phone,
  };
}

function randomCode(len) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

/**
 * POST /api/auth/send-code
 * 发送验证码到邮箱
 * body: { email, type: 'register' | 'reset' }
 */
async function sendCode(req, res, next) {
  try {
    const { email, type } = req.body;
    const emailStr = (email || "").toString().trim().toLowerCase();
    if (!emailStr) {
      return res.status(400).json({ code: 400, message: "请输入邮箱" });
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(emailStr)) {
      return res.status(400).json({ code: 400, message: "邮箱格式不正确" });
    }
    if (!["register", "reset"].includes(type)) {
      return res
        .status(400)
        .json({ code: 400, message: "type 为 register 或 reset" });
    }

    if (type === "register") {
      const exists = await User.findOne({ email: emailStr });
      if (exists) {
        return res.status(400).json({
          code: 400,
          message: "该邮箱已被注册，如果忘记密码请点击忘记密码",
        });
      }
    } else {
      const exists = await User.findOne({ email: emailStr });
      if (!exists) {
        return res.status(400).json({ code: 400, message: "该邮箱未注册" });
      }
    }

    const code = randomCode(CODE_LEN);
    await setVerificationCode(emailStr, code, CODE_EXPIRE);
    await sendEmail(emailStr, code);

    res.json({ code: 0, data: { message: "验证码已发送" } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/register
 * 注册新用户
 * body: { email, password, nickName, code }
 */
async function register(req, res, next) {
  try {
    const { email, password, nickName, code } = req.body;
    const emailStr = (email || "").toString().trim().toLowerCase();
    const nick = (nickName || "").toString().trim();
    const codeStr = (code || "").toString().trim();

    if (!emailStr)
      return res.status(400).json({ code: 400, message: "请输入邮箱" });
    if (!nick)
      return res.status(400).json({ code: 400, message: "请输入昵称" });
    if (!codeStr)
      return res.status(400).json({ code: 400, message: "请输入验证码" });
    if (!password || password.length < MIN_PASSWORD_LEN) {
      return res.status(400).json({ code: 400, message: "密码至少6位" });
    }

    const savedCode = await getVerificationCode(emailStr);
    if (!savedCode || savedCode !== codeStr) {
      return res.status(400).json({ code: 400, message: "验证码错误或已过期" });
    }

    const exists = await User.findOne({ email: emailStr });
    if (exists) {
      return res.status(400).json({
        code: 400,
        message: "该邮箱已被注册，如果忘记密码请点击忘记密码",
      });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email: emailStr,
      password: hashed,
      nickName: nick,
    });
    await deleteVerificationCode(emailStr);

    const token = signToken(user);
    res.status(201).json({
      code: 0,
      data: { token, user: toUserResponse(user) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * 邮箱密码登录
 * body: { email, password }
 */
async function emailLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const emailStr = (email || "").toString().trim().toLowerCase();
    if (!emailStr)
      return res.status(400).json({ code: 400, message: "请输入邮箱" });
    if (!password)
      return res.status(400).json({ code: 400, message: "请输入密码" });

    const user = await User.findOne({ email: emailStr });
    if (!user) {
      return res.status(400).json({ code: 400, message: "邮箱或密码错误" });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ code: 400, message: "邮箱或密码错误" });
    }

    const token = signToken(user);
    res.json({
      code: 0,
      data: { token, user: toUserResponse(user) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/reset-password
 * 重置密码
 * body: { email, code, newPassword }
 */
async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
    const emailStr = (email || "").toString().trim().toLowerCase();
    const codeStr = (code || "").toString().trim();

    if (!emailStr)
      return res.status(400).json({ code: 400, message: "请输入邮箱" });
    if (!codeStr)
      return res.status(400).json({ code: 400, message: "请输入验证码" });
    if (!newPassword || newPassword.length < MIN_PASSWORD_LEN) {
      return res.status(400).json({ code: 400, message: "新密码至少6位" });
    }

    const savedCode = await getVerificationCode(emailStr);
    if (!savedCode || savedCode !== codeStr) {
      return res.status(400).json({ code: 400, message: "验证码错误或已过期" });
    }

    const user = await User.findOne({ email: emailStr });
    if (!user) {
      return res.status(400).json({ code: 400, message: "该邮箱未注册" });
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashed;
    await user.save();
    await deleteVerificationCode(emailStr);

    res.json({ code: 0, data: { message: "密码已重置" } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/wechat-login
 * 微信小程序授权登录
 * body: { code, nickName?, avatarUrl? }
 */
async function wechatLogin(req, res, next) {
  try {
    const { code, nickName, avatarUrl } = req.body;
    const codeStr = (code || "").toString().trim();
    if (!codeStr) {
      return res.status(400).json({ code: 400, message: "缺少 code" });
    }
    const appId = process.env.WECHAT_APPID;
    const secret = process.env.WECHAT_SECRET;
    if (!appId || !secret) {
      return res
        .status(500)
        .json({ code: 500, message: "服务端未配置微信登录" });
    }
    const url = "https://api.weixin.qq.com/sns/jscode2session";
    const { data } = await axios.get(url, {
      params: {
        appid: appId,
        secret,
        js_code: codeStr,
        grant_type: "authorization_code",
      },
    });
    if (data.errcode) {
      return res.status(400).json({
        code: 400,
        message: data.errmsg || "微信登录失败",
      });
    }
    const { openid, unionid } = data;
    let user = await User.findOne({ openId: openid });
    if (user) {
      if (nickName !== undefined || avatarUrl !== undefined) {
        if (nickName !== undefined) user.nickName = nickName;
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
        await user.save();
      }
    } else {
      user = await User.create({
        openId: openid,
        unionId: unionid || undefined,
        nickName: (nickName || "").trim() || "微信用户",
        avatarUrl: avatarUrl || undefined,
      });
    }
    if (user.status !== "active") {
      return res.status(403).json({ code: 403, message: "账号已禁用" });
    }
    const token = signToken(user);
    res.json({
      code: 0,
      data: { token, user: toUserResponse(user) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 设置角色（学生/商家/配送员）
 */
async function setRole(req, res, next) {
  try {
    const { role } = req.body;
    const allowed = ["student", "merchant", "delivery"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ code: 400, message: "无效角色" });
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { role },
      { new: true }
    );
    if (!user)
      return res.status(404).json({ code: 404, message: "用户不存在" });
    const token = signToken(user);
    res.json({
      code: 0,
      data: {
        token,
        user: toUserResponse(user),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendCode,
  register,
  emailLogin,
  wechatLogin,
  resetPassword,
  setRole,
};
