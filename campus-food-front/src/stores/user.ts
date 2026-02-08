// 用户状态管理

import { defineStore } from "pinia";
import { UserInfo, UserState } from "../types/user";
import { getStorage, setStorage, removeStorage } from "../utils/storage";
import { STORAGE_KEYS } from "../utils/constants";

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    userInfo: getStorage<UserInfo>(STORAGE_KEYS.USER_INFO),
    role:
      getStorage<"student" | "merchant" | "delivery">(STORAGE_KEYS.USER_ROLE) ||
      null,
    token: getStorage<string>(STORAGE_KEYS.TOKEN) || "",
    isLogin: !!getStorage<string>(STORAGE_KEYS.TOKEN),
  }),

  getters: {
    // 是否已登录
    isAuthenticated: (state) => state.isLogin && !!state.token,

    // 是否是学生
    isStudent: (state) => state.role === "student",

    // 是否是商家
    isMerchant: (state) => state.role === "merchant",

    // 是否是骑手
    isDelivery: (state) => state.role === "delivery",
  },

  actions: {
    // 设置用户信息
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
      setStorage(STORAGE_KEYS.USER_INFO, userInfo);
    },

    // 更新用户信息（支持部分更新）
    updateUserInfo(updates: Partial<UserInfo>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...updates };
        setStorage(STORAGE_KEYS.USER_INFO, this.userInfo);
      }
    }, 

    // 设置角色
    setRole(role: "student" | "merchant" | "delivery") {
      this.role = role;
      if (this.userInfo) {
        this.userInfo.role = role;
        setStorage(STORAGE_KEYS.USER_INFO, this.userInfo);
      }
      setStorage(STORAGE_KEYS.USER_ROLE, role);
    },

    // 设置token
    setToken(token: string) {
      this.token = token;
      this.isLogin = !!token;
      setStorage(STORAGE_KEYS.TOKEN, token);
    },

    // 登录
    login(userInfo: UserInfo, token: string) {
      this.setUserInfo(userInfo);
      this.setToken(token);
      if (userInfo.role) {
        this.setRole(userInfo.role);
      }
    },

    // 登出
    logout() {
      this.userInfo = null;
      this.role = null;
      this.token = "";
      this.isLogin = false;
      removeStorage(STORAGE_KEYS.USER_INFO);
      removeStorage(STORAGE_KEYS.USER_ROLE);
      removeStorage(STORAGE_KEYS.TOKEN);
    },
  },
});
