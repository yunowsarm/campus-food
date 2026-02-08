<template>
  <view class="merchant-stats">
    <!-- 时间选择 -->
    <view class="time-selector">
      <view
        class="time-item"
        :class="{ active: activeTime === item.value }"
        v-for="item in timeOptions"
        :key="item.value"
        @click="handleTimeChange(item.value)"
      >
        <text>{{ item.label }}</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <text class="stat-label">订单数</text>
        <text class="stat-value">{{ stats.orderCount }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-label">销售额</text>
        <text class="stat-value">¥{{ (stats.sales / 100).toFixed(2) }}</text>
      </view>
      <view class="stat-card">
        <text class="stat-label">客单价</text>
        <text class="stat-value">¥{{ (stats.avgPrice / 100).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 指标对比柱状图 -->
    <view class="chart-section">
      <text class="section-title">指标对比</text>
      <view class="bar-chart">
        <view class="bar-item" v-for="item in barChartData" :key="item.label">
          <view class="bar-wrap">
            <view
              class="bar-fill"
              :style="{ width: item.percent + '%' }"
              :class="item.type"
            ></view>
          </view>
          <text class="bar-label">{{ item.label }}</text>
          <text class="bar-value">{{ item.text }}</text>
        </view>
      </view>
    </view>

    <!-- 热门菜品 横向条形图 -->
    <view class="chart-section hot-chart">
      <text class="section-title">热门菜品 Top10</text>
      <view class="horizontal-bars">
        <view
          class="h-bar-item"
          v-for="(food, index) in hotFoods"
          :key="food.id || index"
        >
          <text class="h-bar-name">{{ index + 1 }}. {{ food.name }}</text>
          <view class="h-bar-track">
            <view
              class="h-bar-fill"
              :style="{ width: getHotPercent(food.sales) + '%' }"
            ></view>
          </view>
          <text class="h-bar-sales">{{ food.sales }} 份</text>
        </view>
      </view>
      <view class="empty-chart-tip" v-if="hotFoods.length === 0">
        <text>暂无销量数据</text>
      </view>
    </view>

    <!-- 订单状态分布 -->
    <view class="chart-section" v-if="statusBars.length > 0">
      <text class="section-title">订单状态分布</text>
      <view class="horizontal-bars status-bars">
        <view class="h-bar-item" v-for="s in statusBars" :key="s.status">
          <text class="h-bar-name">{{ s.label }}</text>
          <view class="h-bar-track">
            <view
              class="h-bar-fill status-fill"
              :style="{ width: s.percent + '%' }"
            ></view>
          </view>
          <text class="h-bar-sales">{{ s.count }} 单</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getMerchantStats } from "@/api/merchants";
import type { MerchantStats } from "@/api/merchants";

const ORDER_STATUS_LABEL: Record<string, string> = {
  unpaid: "待支付",
  paid: "已支付",
  preparing: "备餐中",
  delivering: "配送中",
  completed: "已完成",
  cancelled: "已取消",
  refunded: "已退款",
  pending_group: "待成团",
};

const activeTime = ref<"today" | "week" | "month">("today");
const timeOptions: { value: "today" | "week" | "month"; label: string }[] = [
  { value: "today", label: "今日" },
  { value: "week", label: "本周" },
  { value: "month", label: "本月" },
];

const stats = ref({
  orderCount: 0,
  sales: 0,
  avgPrice: 0,
});

const statusCounts = ref<Record<string, number>>({});
const hotFoods = ref<{ id: string; name: string; sales: number }[]>([]);

// 指标对比柱状图数据（归一化到 0-100 显示相对高度）
const barChartData = computed(() => {
  const s = stats.value;
  const maxOrder = Math.max(s.orderCount, 1);
  const maxSales = Math.max(s.sales / 100, 1);
  const maxAvg = Math.max(s.avgPrice / 100, 1);
  const max = Math.max(maxOrder, maxSales, maxAvg);
  return [
    {
      label: "订单数",
      text: String(s.orderCount),
      percent: (s.orderCount / max) * 100,
      type: "type-order",
    },
    {
      label: "销售额(元)",
      text: (s.sales / 100).toFixed(2),
      percent: (s.sales / 100 / max) * 100,
      type: "type-sales",
    },
    {
      label: "客单价(元)",
      text: (s.avgPrice / 100).toFixed(2),
      percent: (s.avgPrice / 100 / max) * 100,
      type: "type-avg",
    },
  ];
});

// 热门菜品销量占比（相对最大销量 100%）
const hotMaxSales = computed(() =>
  Math.max(...hotFoods.value.map((f) => f.sales), 1)
);
const getHotPercent = (sales: number) => (sales / hotMaxSales.value) * 100;

// 订单状态分布
const statusBars = computed(() => {
  const counts = statusCounts.value;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return Object.entries(counts).map(([status, count]) => ({
    status,
    label: ORDER_STATUS_LABEL[status] || status,
    count,
    percent: (count / total) * 100,
  }));
});

const handleTimeChange = (value: "today" | "week" | "month") => {
  activeTime.value = value;
  loadStats();
};

const loadStats = async () => {
  try {
    const data = await getMerchantStats(activeTime.value);
    stats.value = {
      orderCount: data.orderCount,
      sales: data.sales,
      avgPrice: data.avgPrice,
    };
    statusCounts.value = data.statusCounts || {};
    hotFoods.value = data.hotFoods || [];
  } catch (error) {
    console.error("获取统计失败:", error);
  }
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped lang="scss">
.merchant-stats {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.time-selector {
  display: flex;
  background: #ffffff;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
}

.time-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666666;
  border-radius: 12rpx;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.stat-card {
  background: #ffffff;
  padding: 40rpx 20rpx;
  border-radius: 16rpx;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 10rpx;
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
}

.chart-section {
  background: #ffffff;
  margin: 0 30rpx 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.chart-section .section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 24rpx;
  display: block;
}

/* 指标对比柱状图 */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.bar-wrap {
  flex: 1;
  height: 48rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8rpx;
  min-width: 4%;
  transition: width 0.3s ease;

  &.type-order {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
  &.type-sales {
    background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  }
  &.type-avg {
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  }
}

.bar-label {
  width: 140rpx;
  font-size: 26rpx;
  color: #666666;
  flex-shrink: 0;
}

.bar-value {
  width: 120rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
  text-align: right;
  flex-shrink: 0;
}

/* 热门菜品横向条形图 */
.hot-chart .horizontal-bars {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.h-bar-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.h-bar-name {
  width: 200rpx;
  font-size: 26rpx;
  color: #333333;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.h-bar-track {
  flex: 1;
  height: 36rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.h-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 6rpx;
  min-width: 4%;
  transition: width 0.3s ease;
}

.h-bar-fill.status-fill {
  background: linear-gradient(90deg, #a8edea 0%, #fed6e3 100%);
}

.h-bar-sales {
  width: 100rpx;
  font-size: 24rpx;
  color: #999999;
  text-align: right;
  flex-shrink: 0;
}

.status-bars .h-bar-name {
  width: 140rpx;
}

.empty-chart-tip {
  text-align: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #999999;
}
</style>
