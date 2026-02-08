<template>
  <view class="forgot-container">
    <view class="header">
      <text class="title">忘记密码</text>
      <text class="subtitle">通过邮箱验证码重置密码</text>
    </view>

    <view class="form">
      <view class="input-wrap">
        <input
          v-model="email"
          type="text"
          placeholder="请输入注册邮箱"
          class="input"
        />
      </view>
      <view class="input-wrap code-row">
        <input
          v-model="code"
          type="number"
          maxlength="6"
          placeholder="验证码"
          class="input code-input"
        />
        <button
          class="code-btn"
          :disabled="countdown > 0"
          @click="handleSendCode"
        >
          {{ countdown > 0 ? `${countdown}s后重发` : "获取验证码" }}
        </button>
      </view>
      <view class="input-wrap">
        <input
          v-model="newPassword"
          :password="!showPwd"
          placeholder="新密码（至少6位）"
          class="input"
        />
        <text class="toggle-pwd" @click="showPwd = !showPwd">
          {{ showPwd ? "隐藏" : "显示" }}
        </text>
      </view>
      <view class="input-wrap">
        <input
          v-model="confirmPassword"
          :password="!showPwd2"
          placeholder="请再次输入新密码"
          class="input"
        />
        <text class="toggle-pwd" @click="showPwd2 = !showPwd2">
          {{ showPwd2 ? "隐藏" : "显示" }}
        </text>
      </view>
      <button class="submit-btn" @click="handleReset">确认重置</button>
      <text class="link" @click="goLogin">返回登录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { sendVerificationCode, resetPassword } from "@/api/auth";

const email = ref("");
const code = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showPwd = ref(false);
const showPwd2 = ref(false);
const countdown = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handleSendCode = async () => {
  const e = email.value.trim().toLowerCase();
  if (!e) {
    uni.showToast({ title: "请输入邮箱", icon: "none" });
    return;
  }
  if (!emailReg.test(e)) {
    uni.showToast({ title: "邮箱格式不正确", icon: "none" });
    return;
  }
  try {
    await sendVerificationCode({ email: e, type: "reset" });
    uni.showToast({ title: "验证码已发送", icon: "success" });
    countdown.value = 60;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0 && countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }, 1000);
  } catch (err: any) {
    uni.showToast({ title: err.message || "发送失败", icon: "none" });
  }
};

const handleReset = async () => {
  const e = email.value.trim().toLowerCase();
  const c = code.value.trim();
  const p = newPassword.value;
  const cp = confirmPassword.value;

  if (!e) {
    uni.showToast({ title: "请输入邮箱", icon: "none" });
    return;
  }
  if (!emailReg.test(e)) {
    uni.showToast({ title: "邮箱格式不正确", icon: "none" });
    return;
  }
  if (!c || c.length !== 6) {
    uni.showToast({ title: "请输入6位验证码", icon: "none" });
    return;
  }
  if (!p || p.length < 6) {
    uni.showToast({ title: "新密码至少6位", icon: "none" });
    return;
  }
  if (p !== cp) {
    uni.showToast({ title: "两次密码不一致", icon: "none" });
    return;
  }

  try {
    uni.showLoading({ title: "重置中..." });
    await resetPassword({ email: e, code: c, newPassword: p });
    uni.hideLoading();
    uni.showToast({ title: "密码已重置", icon: "success" });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (err: any) {
    uni.hideLoading();
    uni.showToast({ title: err.message || "重置失败", icon: "none" });
  }
};

const goLogin = () => {
  uni.navigateBack();
};
</script>

<style scoped lang="scss">
.forgot-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 60rpx 40rpx;
}

.header {
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #999;
}

.form {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
}

.input-wrap {
  position: relative;
  margin-bottom: 28rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
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
  margin-left: 16rpx;
}

.code-row {
  padding-right: 8rpx;
}

.code-input {
  flex: 1;
  min-width: 0;
}

.code-btn {
  flex-shrink: 0;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  color: #667eea;
  background: transparent;
  margin-left: 16rpx;
  &::after {
    border: none;
  }
}

.code-btn[disabled] {
  color: #999;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
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

.link {
  display: block;
  text-align: center;
  font-size: 28rpx;
  color: #667eea;
}
</style>
