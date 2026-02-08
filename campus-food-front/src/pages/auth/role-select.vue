<template>
  <view class="role-select-container">
    <view class="header">
      <text class="title">选择您的身份</text>
      <text class="subtitle">选择后将进入对应的功能页面</text>
    </view>

    <view class="role-list">
      <view class="role-item" @click="selectRole('student')">
        <view class="role-icon student-icon">
          <text class="icon-text">👨‍🎓</text>
        </view>
        <text class="role-name">我是学生</text>
        <text class="role-desc">发现美食，参与拼单</text>
      </view>

      <view class="role-item" @click="selectRole('merchant')">
        <view class="role-icon merchant-icon">
          <text class="icon-text">🏪</text>
        </view>
        <text class="role-name">我是商家</text>
        <text class="role-desc">发布美食，管理订单</text>
      </view>

      <view class="role-item" @click="selectRole('delivery')">
        <view class="role-icon delivery-icon">
          <text class="icon-text">🛵</text>
        </view>
        <text class="role-name">我是骑手</text>
        <text class="role-desc">抢单配送，赚取收入</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { setRole } from "../../api/auth";
import { useUserStore } from "../../stores/user";

const userStore = useUserStore();

const selectRole = async (role: "student" | "merchant" | "delivery") => {
  try {
    const res = await setRole(role) as { token?: string; user?: any };
    const token = res.token;
    const user = res.user;
    if (token) userStore.setToken(token);
    userStore.setRole(role);
    if (user) userStore.setUserInfo(user);

    const homePath =
      role === "student"
        ? "/pages/student/home/index"
        : role === "delivery"
          ? "/pages/delivery/home/index"
          : "/pages/merchant/home/index";
    uni.reLaunch({ url: homePath });
  } catch (error) {
    console.error("选择角色失败:", error);
    uni.showToast({
      title: "选择失败，请重试",
      icon: "none",
    });
  }
};
</script>

<style scoped lang="scss">
.role-select-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 60rpx 40rpx;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #999999;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.role-item {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }
}

.role-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.student-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.merchant-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.delivery-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.icon-text {
  font-size: 60rpx;
}

.role-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.role-desc {
  font-size: 26rpx;
  color: #999999;
}
</style>
