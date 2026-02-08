<template>
  <view class="merchant-home">
    <!-- 店铺状态卡片 -->
    <view class="shop-status-card">
      <view class="shop-info">
        <text class="shop-name">{{
          merchantStore.merchantInfo?.name || "我的店铺"
        }}</text>
        <view class="status-switch">
          <text class="status-label">{{ isOpen ? "营业中" : "已打烊" }}</text>
          <switch
            :checked="isOpen"
            :disabled="!hasMerchant"
            @change="handleStatusChange"
            color="#667eea"
          />
        </view>
      </view>
    </view>

    <!-- 今日统计 -->
    <view class="stats-section">
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ todayStats.orderCount }}</text>
          <text class="stat-label">订单数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value"
            >¥{{ (todayStats.sales / 100).toFixed(2) }}</text
          >
          <text class="stat-label">销售额</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ todayStats.newOrderCount }}</text>
          <text class="stat-label">待处理</text>
        </view>
      </view>
    </view>

    <!-- 待处理订单 -->
    <view class="pending-orders-section">
      <view class="section-header">
        <text class="section-title">待处理订单</text>
        <text class="view-all" @click="goToOrders">查看全部 ></text>
      </view>
      <view class="order-list">
        <view
          class="order-card"
          v-for="order in pendingOrders"
          :key="order.id"
          @click="handleOrderClick(order.id)"
        >
          <view class="order-header">
            <text class="order-no">{{ order.orderNo }}</text>
            <text class="order-status" :class="`status-${order.status}`">
              {{ getStatusText(order.status) }}
            </text>
          </view>
          <view class="order-items">
            <view class="item" v-for="item in order.items" :key="item.id">
              <text class="item-name"
                >{{ item.foodName }} x{{ item.quantity }}</text
              >
            </view>
          </view>
          <view class="order-footer">
            <text class="order-price"
              >¥{{ (order.finalPrice / 100).toFixed(2) }}</text
            >
            <view class="order-actions">
              <button
                v-if="order.status === 'paid'"
                class="btn btn-primary"
                size="mini"
                @click.stop="handleStartPreparing(order.id)"
              >
                开始备餐
              </button>
              <button
                v-if="order.status === 'preparing'"
                class="btn btn-success"
                size="mini"
                @click.stop="handleFinishPreparing(order.id)"
              >
                出餐完成
              </button>
            </view>
          </view>
        </view>
      </view>
      <view class="empty-state" v-if="pendingOrders.length === 0">
        <text class="empty-text">暂无待处理订单</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-item" @click="goToFoods">
        <text class="action-icon">🍔</text>
        <text class="action-label">菜品管理</text>
      </view>
      <view class="action-item" @click="goToStats">
        <text class="action-icon">📊</text>
        <text class="action-label">数据统计</text>
      </view>
      <view class="action-item" @click="goToShop">
        <text class="action-icon">🏪</text>
        <text class="action-label">店铺设置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app";
import { useMerchantStore } from "@/stores/merchant";
import { getMerchantMe, updateMerchant } from "@/api/merchants";
import { getOrderList, startPreparing, finishPreparing } from "@/api/order";
import type { Order } from "@/types/order";

const merchantStore = useMerchantStore();
const isOpen = ref(false);
const todayStats = ref({ orderCount: 0, sales: 0, newOrderCount: 0 });
const pendingOrders = ref<Order[]>([]);

const hasMerchant = computed(
  () => !!(merchantStore.merchantInfo?._id || merchantStore.merchantInfo?.id)
);

const syncOpenFromMerchant = () => {
  if (!hasMerchant.value) {
    isOpen.value = false;
    return;
  }
  const status = merchantStore.merchantInfo?.status;
  isOpen.value = status === "open";
};

const fetchPendingOrders = async () => {
  try {
    const res = await getOrderList({ status: "paid,preparing", pageSize: 5 });
    const list = res.list || [];
    pendingOrders.value = list.map((o: Order & { _id?: string }) => ({
      ...o,
      id: o.id || o._id,
      items: (o.items || []).map(
        (it: Order["items"][0] & { _id?: string }, idx: number) => ({
          ...it,
          id: it.id || it._id || `item-${o.id || o._id}-${idx}`,
        })
      ),
    }));
    todayStats.value.newOrderCount = list.filter(
      (o) => o.status === "paid"
    ).length;
  } catch (error) {
    console.error("获取待处理订单失败:", error);
  }
};

const handleStatusChange = async (e: any) => {
  if (!hasMerchant.value) {
    isOpen.value = false;
    uni.showToast({ title: "请先完善店铺信息", icon: "none" });
    return;
  }
  const open = e.detail.value;
  const merchantId =
    merchantStore.merchantInfo?._id || merchantStore.merchantInfo?.id;
  if (!merchantId) {
    isOpen.value = false;
    uni.showToast({ title: "请先完善店铺信息", icon: "none" });
    return;
  }
  try {
    const updated = await updateMerchant(merchantId, {
      status: open ? "open" : "closed",
    });
    isOpen.value = open;
    if (updated) merchantStore.setMerchantInfo(updated);
    uni.showToast({ title: open ? "已营业" : "已打烊", icon: "success" });
  } catch (err: any) {
    isOpen.value = !open;
    uni.showToast({ title: err.message || "更新失败", icon: "none" });
  }
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    paid: "待接单",
    preparing: "备餐中",
    delivering: "配送中",
    completed: "已完成",
  };
  return map[status] || status;
};

const handleOrderClick = (orderId: string) => {
  uni.navigateTo({ url: `/pages/merchant/order-detail/index?id=${orderId}` });
};

const handleStartPreparing = async (orderId: string) => {
  try {
    await startPreparing(orderId);
    uni.showToast({ title: "已开始备餐", icon: "success" });
    fetchPendingOrders();
  } catch (error: any) {
    uni.showToast({ title: error.message || "操作失败", icon: "none" });
  }
};

const handleFinishPreparing = async (orderId: string) => {
  try {
    await finishPreparing(orderId);
    uni.showToast({ title: "出餐完成", icon: "success" });
    fetchPendingOrders();
  } catch (error: any) {
    uni.showToast({ title: error.message || "操作失败", icon: "none" });
  }
};

const goToOrders = () =>
  uni.navigateTo({ url: "/pages/merchant/orders/index" });
const goToFoods = () => uni.navigateTo({ url: "/pages/merchant/foods/index" });
const goToStats = () => uni.navigateTo({ url: "/pages/merchant/stats/index" });
const goToShop = () => uni.navigateTo({ url: "/pages/merchant/shop/index" });

onShow(async () => {
  if (!merchantStore.merchantId) {
    try {
      const me = await getMerchantMe({ silentError: true });
      if (me) merchantStore.setMerchantInfo(me);
    } catch {}
  }
  syncOpenFromMerchant();
  fetchPendingOrders();
});

onPullDownRefresh(async () => {
  await fetchPendingOrders();
  uni.stopPullDownRefresh();
});

onMounted(() => {
  syncOpenFromMerchant();
  fetchPendingOrders();
});
</script>

<style scoped lang="scss">
.merchant-home {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.shop-status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  color: #ffffff;
}

.shop-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shop-name {
  font-size: 36rpx;
  font-weight: bold;
}

.status-switch {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.status-label {
  font-size: 28rpx;
}

.stats-section {
  background: #ffffff;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

.pending-orders-section {
  margin: 20rpx 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.view-all {
  font-size: 26rpx;
  color: #667eea;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.order-no {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.order-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;

  &.status-paid {
    background: #fff3e0;
    color: #ff9500;
  }

  &.status-preparing {
    background: #e3f2fd;
    color: #2196f3;
  }
}

.order-items {
  margin-bottom: 20rpx;
}

.item {
  margin-bottom: 10rpx;
}

.item-name {
  font-size: 26rpx;
  color: #666666;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.order-actions {
  display: flex;
  gap: 20rpx;
}

.btn {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-size: 24rpx;

  &.btn-primary {
    background: #667eea;
    color: #ffffff;
  }

  &.btn-success {
    background: #52c41a;
    color: #ffffff;
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin: 20rpx 30rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 20rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.action-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.action-label {
  font-size: 26rpx;
  color: #666666;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
  background: #ffffff;
  border-radius: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999999;
}
</style>
