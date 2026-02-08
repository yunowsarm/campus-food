<template>
  <view class="order-list-container">
    <!-- 订单状态标签 -->
    <view class="status-tabs">
      <view
        class="status-tab"
        :class="{ active: selectedStatus === item.value }"
        v-for="item in statusTabs"
        :key="item.value"
        @click="handleStatusClick(item.value as OrderStatus | '')"
      >
        <text>{{ item.label }}</text>
        <text class="badge" v-if="item.count > 0">{{ item.count }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <OrderCard
        v-for="order in orderList"
        :key="order.id"
        :order="order"
        @click="handleOrderClick"
        @pay="handlePay"
        @cancel="handleCancel"
        @track="handleTrack"
        @review="handleReview"
      />
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <text class="load-more-text">加载中...</text>
    </view>
    <view class="no-more" v-else-if="orderList.length > 0">
      <text class="no-more-text">没有更多了</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && orderList.length === 0">
      <text class="empty-text">暂无订单</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onReachBottom, onPullDownRefresh } from "@dcloudio/uni-app";
import OrderCard from "@/components/OrderCard/OrderCard.vue";
import { getOrderList, payOrder, cancelOrder } from "@/api/order";
import { Order, OrderStatus } from "@/types/order";
import { useOrderStore } from "@/stores/order";

const orderStore = useOrderStore();

const selectedStatus = ref<OrderStatus | "">("");
const orderList = ref<Order[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const loading = ref(false);

// 独立维护的订单统计（不随筛选变化）
const orderCounts = ref({
  all: 0,
  unpaid: 0,
  undelivered: 0,
  completed: 0,
});

// 状态标签（使用独立的统计数据）
const statusTabs = computed(() => [
  { label: "全部", value: "", count: orderCounts.value.all },
  { label: "待付款", value: "unpaid", count: orderCounts.value.unpaid },
  { label: "待收货", value: "undelivered", count: orderCounts.value.undelivered },
  { label: "已完成", value: "completed", count: orderCounts.value.completed },
]);

// 获取订单统计信息（各状态的订单数量）
const fetchOrderCounts = async () => {
  try {
    // 并行请求各个状态的订单数量
    const [allRes, unpaidRes, undeliveredRes, completedRes] = await Promise.all([
      getOrderList({ page: 1, pageSize: 1 }), // 只获取统计，不需要完整列表
      getOrderList({ page: 1, pageSize: 1, status: "unpaid" }),
      getOrderList({ page: 1, pageSize: 1, status: "undelivered" }),
      getOrderList({ page: 1, pageSize: 1, status: "completed" }),
    ]);

    orderCounts.value = {
      all: allRes.total || 0,
      unpaid: unpaidRes.total || 0,
      undelivered: undeliveredRes.total || 0,
      completed: completedRes.total || 0,
    };
  } catch (error) {
    console.error("获取订单统计失败:", error);
  }
};

// 规范化订单数据（将 _id 转换为 id）
const normalizeOrder = (order: any): Order => {
  return {
    ...order,
    id: order.id || order._id,
  };
};

// 获取订单列表
const fetchOrderList = async (page: number = 1) => {
  if (loading.value) return;

  loading.value = true;
  try {
    const response = await getOrderList({
      page,
      pageSize: pageSize.value,
      status: selectedStatus.value || undefined,
    });

    // 规范化订单数据
    const normalizedList = response.list.map(normalizeOrder);

    if (page === 1) {
      orderList.value = normalizedList;
    } else {
      orderList.value.push(...normalizedList);
    }

    // 不再更新 store 的 orderList，避免影响统计
    // orderStore.setOrderList(orderList.value);

    hasMore.value = response.list.length >= pageSize.value;
    currentPage.value = page;
  } catch (error) {
    console.error("获取订单列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 状态点击
const handleStatusClick = (status: OrderStatus | "") => {
  selectedStatus.value = status;
  currentPage.value = 1;
  fetchOrderList(1);
};

// 订单点击
const handleOrderClick = (order: Order) => {
  uni.navigateTo({
    url: `/pages/student/order/track?id=${order.id}`,
  });
};

// 支付
const handlePay = async (order: Order) => {
  try {
    const { payParams } = await payOrder(order.id!);
    uni.requestPayment({
      provider: "wxpay",
      ...payParams,
      success: () => {
        uni.showToast({
          title: "支付成功",
          icon: "success",
        });
        fetchOrderList(currentPage.value);
        fetchOrderCounts(); // 刷新统计
      },
    });
  } catch (error) {
    console.error("支付失败:", error);
  }
};

// 取消订单
const handleCancel = async (order: Order) => {
  uni.showModal({
    title: "确认取消",
    content: "确定要取消这个订单吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(order.id!);
          uni.showToast({
            title: "已取消",
            icon: "success",
          });
          fetchOrderList(currentPage.value);
          fetchOrderCounts(); // 刷新统计
        } catch (error) {
          console.error("取消订单失败:", error);
        }
      }
    },
  });
};

// 查看物流
const handleTrack = (order: Order) => {
  uni.navigateTo({
    url: `/pages/student/order/track?id=${order.id}`,
  });
};

// 评价（跳转写评价，使用订单第一项菜品）
const handleReview = (order: Order) => {
  const firstItem = order.items?.[0];
  const foodId = firstItem?.foodId || (firstItem as any)?.id;
  const orderId = order.id || (order as any)?._id;
  if (!orderId || !foodId) {
    uni.showToast({ title: "订单无菜品信息", icon: "none" });
    return;
  }
  uni.navigateTo({
    url: `/pages/student/review/submit?orderId=${orderId}&targetType=food&targetId=${foodId}`,
  });
};

// 下拉刷新
onPullDownRefresh(async () => {
  currentPage.value = 1;
  await Promise.all([
    fetchOrderList(1),
    fetchOrderCounts() // 刷新统计
  ]);
  uni.stopPullDownRefresh();
});

// 上拉加载更多
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    fetchOrderList(currentPage.value + 1);
  }
});

onMounted(() => {
  // 初始化时同时获取列表和统计
  fetchOrderList(1);
  fetchOrderCounts();
});
</script>

<style scoped lang="scss">
.order-list-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.status-tabs {
  background: #ffffff;
  display: flex;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.status-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  font-size: 28rpx;
  color: #666666;

  &.active {
    color: #667eea;

    &::after {
      content: "";
      position: absolute;
      bottom: -20rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #667eea;
      border-radius: 2rpx;
    }
  }
}

.badge {
  font-size: 20rpx;
  background: #ff6b6b;
  color: #ffffff;
  padding: 2rpx 8rpx;
  border-radius: 10rpx;
  margin-top: 4rpx;
}

.order-list {
  padding: 0 30rpx;
}

.load-more,
.no-more,
.empty-state {
  text-align: center;
  padding: 40rpx 0;
}

.load-more-text,
.no-more-text,
.empty-text {
  font-size: 26rpx;
  color: #999999;
}
</style>
