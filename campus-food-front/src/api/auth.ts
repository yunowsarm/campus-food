// 认证接口 - 对应后端 /api/auth

import defHttp from "../utils/request";
import type { UserInfo } from "../types/user";

export interface LoginResult {
  token: string;
  user: Pick<UserInfo, "id" | "nickName" | "avatarUrl" | "role" | "phone">;
}

/** 发送验证码 */
export function sendVerificationCode(data: {
  email: string;
  type: "register" | "reset";
}) {
  return defHttp.Post<{ message: string }>("/api/auth/send-code", data);
}

/** 注册 */
export function register(data: {
  email: string;
  password: string;
  nickName: string;
  code: string;
}) {
  return defHttp.Post<LoginResult>("/api/auth/register", data);
}

/** 邮箱登录 */
export function emailLogin(data: { email: string; password: string }) {
  return defHttp.Post<LoginResult>("/api/auth/login", data);
}

/** 微信授权登录 */
export function wechatLogin(data: {
  code: string;
  nickName?: string;
  avatarUrl?: string;
}) {
  return defHttp.Post<LoginResult>("/api/auth/wechat-login", data, {
    showLoading: true,
    loadingText: "登录中...",
  });
}

/** 重置密码 */
export function resetPassword(data: {
  email: string;
  code: string;
  newPassword: string;
}) {
  return defHttp.Post<{ message: string }>("/api/auth/reset-password", data);
}

/** 设置角色（学生/商家/配送员） */
export function setRole(role: "student" | "merchant" | "delivery") {
  return defHttp.Post<LoginResult>("/api/auth/set-role", { role });
}
