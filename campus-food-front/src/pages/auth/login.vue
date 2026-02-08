<template>
  <view class="login-container">
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">校园美食拼单</text>
      <text class="slogan">发现美食，一起拼单</text>
    </view>

    <view class="form-section">
      <button
        v-if="isWechat"
        class="wechat-btn"
        open-type="getUserProfile"
        @getuserinfo="handleWechatLogin"
      >
        微信一键登录
      </button>
      <view v-if="isWechat" class="divider">
        <text class="divider-text">或</text>
      </view>
      <view class="input-wrap">
        <input
          v-model="email"
          type="text"
          placeholder="请输入邮箱"
          class="input"
        />
      </view>
      <view class="input-wrap">
        <input
          v-model="password"
          :password="!showPwd"
          placeholder="请输入密码"
          class="input"
        />
        <text class="toggle-pwd" @click="showPwd = !showPwd">
          {{ showPwd ? "隐藏" : "显示" }}
        </text>
      </view>
      <button class="login-btn" @click="handleLogin">邮箱登录</button>
      <view class="links">
        <text class="link" @click="goRegister">没有账号？去注册</text>
        <text class="link" @click="goForgot">忘记密码？</text>
      </view>
      <text class="tip">登录即表示同意《用户协议》和《隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { emailLogin, wechatLogin } from "@/api/auth";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const email = ref("");
const password = ref("");
const showPwd = ref(false);

const isWechat = computed(() => {
  // #ifdef MP-WEIXIN
  return true;
  // #endif
  return false;
});

const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const doAfterLogin = (user: any, token: string) => {
  userStore.login(user, token);
  if (user.role) {
    const homePath =
      user.role === "student"
        ? "/pages/student/home/index"
        : user.role === "delivery"
          ? "/pages/delivery/home/index"
          : "/pages/merchant/home/index";
    uni.reLaunch({ url: homePath });
  } else {
    uni.reLaunch({ url: "/pages/auth/role-select" });
  }
};

const handleWechatLogin = async (e: any) => {
  const detail = e?.detail;
  if (detail?.errMsg && detail.errMsg.indexOf("deny") >= 0) {
    return;
  }
  try {
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: "weixin",
        success: resolve,
        fail: reject,
      });
    });
    const code = loginRes.code;
    if (!code) {
      uni.showToast({ title: "获取登录态失败", icon: "none" });
      return;
    }
    const userInfo = detail?.userInfo;
    const { token, user } = await wechatLogin({
      code,
      nickName: userInfo?.nickName,
      avatarUrl: userInfo?.avatarUrl,
    });
    doAfterLogin(user, token);
  } catch (err: any) {
    uni.showToast({ title: err.message || "微信登录失败", icon: "none" });
  }
};

const handleLogin = async () => {
  const e = email.value.trim().toLowerCase();
  const p = password.value;
  if (!e) {
    uni.showToast({ title: "请输入邮箱", icon: "none" });
    return;
  }
  if (!emailReg.test(e)) {
    uni.showToast({ title: "邮箱格式不正确", icon: "none" });
    return;
  }
  if (!p) {
    uni.showToast({ title: "请输入密码", icon: "none" });
    return;
  }
  try {
    uni.showLoading({ title: "登录中..." });
    const { token, user } = await emailLogin({ email: e, password: p });
    uni.hideLoading();
    doAfterLogin(user, token);
  } catch (err: any) {
    uni.hideLoading();
    uni.showToast({ title: err.message || "登录失败", icon: "none" });
  }
};

const goRegister = () => {
  uni.navigateTo({ url: "/pages/auth/register" });
};
const goForgot = () => {
  uni.navigateTo({ url: "/pages/auth/forgot-password" });
};

onMounted(() => {
  if (userStore.isLogin && userStore.role) {
    const homePath =
      userStore.role === "student"
        ? "/pages/student/home/index"
        : userStore.role === "delivery"
          ? "/pages/delivery/home/index"
          : "/pages/merchant/home/index";
    uni.reLaunch({ url: homePath });
  } else if (userStore.isLogin) {
    uni.reLaunch({ url: "/pages/auth/role-select" });
  }
});
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 40rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.slogan {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-section {
  width: 100%;
}

.input-wrap {
  position: relative;
  margin-bottom: 30rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 44rpx;
  padding: 0 30rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
}

.input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.toggle-pwd {
  font-size: 26rpx;
  color: #667eea;
  margin-left: 20rpx;
}

.wechat-btn {
  width: 100%;
  height: 88rpx;
  background: #07c160;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  border: none;
  &::after {
    border: none;
  }
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.divider-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: #ffffff;
  color: #667eea;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  margin-bottom: 30rpx;
  border: none;
  &::after {
    border: none;
  }
}

.links {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.link {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.95);
}

.tip {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  display: block;
}
</style>
