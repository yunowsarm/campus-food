<template>
  <view class="mine-container">
    <!-- 用户信息 -->
    <view class="user-section" @click="handleEditProfile">
      <image
        class="avatar"
        :src="userStore.userInfo?.avatarUrl || '/static/cover/cover.png'"
        mode="aspectFill"
      />
      <view class="user-info">
        <text class="nickname">{{
          userStore.userInfo?.nickName || "未登录"
        }}</text>
        <text class="role" v-if="userStore.role">{{
          userStore.role === "student" ? "学生" : "商家"
        }}</text>
      </view>
      <text class="edit-tip">编辑 ></text>
    </view>

    <!-- 订单入口 -->
    <view class="order-section">
      <view class="order-header" @click="handleOrderClick">
        <text class="order-title">我的订单</text>
        <text class="order-more">查看全部 ></text>
      </view>
      <view class="order-tabs">
        <view
          class="order-tab"
          v-for="item in orderTabs"
          :key="item.status"
          @click="handleOrderStatusClick(item.status)"
        >
          <text class="tab-icon">{{ item.icon }}</text>
          <text class="tab-label">{{ item.label }}</text>
          <text class="tab-badge" v-if="item.count > 0">{{ item.count }}</text>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="handleFavoriteClick">
          <text class="menu-icon">❤️</text>
          <text class="menu-label">我的收藏</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="handleGroupClick">
          <text class="menu-icon">👥</text>
          <text class="menu-label">我的拼单</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="handleAddressClick">
          <text class="menu-icon">📍</text>
          <text class="menu-label">配送地址</text>
          <text class="menu-arrow">></text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="handleSettingsClick">
          <text class="menu-icon">⚙️</text>
          <text class="menu-label">编辑资料</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="handleAboutClick">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-label">关于我们</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useOrderStore } from "@/stores/order";

const userStore = useUserStore();
const orderStore = useOrderStore();

const orderTabs = computed(() => [
  {
    icon: "⏰",
    label: "待付款",
    status: "unpaid",
    count: orderStore.orderStats.unpaid,
  },
  {
    icon: "📦",
    label: "待收货",
    status: "undelivered",
    count: orderStore.orderStats.undelivered,
  },
  {
    icon: "✅",
    label: "已完成",
    status: "completed",
    count: orderStore.orderStats.completed,
  },
  {
    icon: "💰",
    label: "退款",
    status: "refunded",
    count: orderStore.orderStats.refunded,
  },
]);

// 订单点击
const handleOrderClick = () => {
  uni.navigateTo({
    url: "/pages/student/order/list",
  });
};

// 订单状态点击
const handleOrderStatusClick = (status: string) => {
  uni.navigateTo({
    url: `/pages/student/order/list?status=${status}`,
  });
};

// 收藏点击
const handleFavoriteClick = () => {
  uni.navigateTo({
    url: "/pages/student/favorite/index",
  });
};

// 拼单点击
const handleGroupClick = () => {
  uni.navigateTo({
    url: "/pages/student/group/index",
  });
};

// 地址点击
const handleAddressClick = () => {
  uni.showToast({
    title: "地址管理功能待开发",
    icon: "none",
  });
};

// 编辑资料
const handleEditProfile = () => {
  if (!userStore.isLogin) {
    uni.showToast({ title: "请先登录", icon: "none" });
    return;
  }
  uni.navigateTo({ url: "/pages/student/profile/edit" });
};

// 设置点击（进入编辑资料）
const handleSettingsClick = () => {
  if (!userStore.isLogin) {
    uni.showToast({ title: "请先登录", icon: "none" });
    return;
  }
  uni.navigateTo({ url: "/pages/student/profile/edit" });
};

// 关于点击
const handleAboutClick = () => {
  uni.showToast({
    title: "关于我们功能待开发",
    icon: "none",
  });
};

onMounted(() => {
  // 刷新订单统计
  orderStore.updateOrderStats();
});
</script>

<style scoped lang="scss">
.mine-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx;
  padding-top: calc(60rpx + env(safe-area-inset-top));
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.edit-tip {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.role {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.order-section {
  background: #ffffff;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.order-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.order-more {
  font-size: 26rpx;
  color: #999999;
}

.order-tabs {
  display: flex;
  justify-content: space-around;
}

.order-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.tab-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.tab-label {
  font-size: 24rpx;
  color: #666666;
}

.tab-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #ff6b6b;
  color: #ffffff;
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.menu-section {
  margin: 20rpx 30rpx;
}

.menu-group {
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-label {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 28rpx;
  color: #999999;
}
</style>
