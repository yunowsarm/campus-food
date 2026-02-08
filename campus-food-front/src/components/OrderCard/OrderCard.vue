<template>
  <view class="order-card" @click="handleCardClick">
    <view class="order-header">
      <text class="merchant-name">{{ order.merchantName }}</text>
      <text class="order-status" :class="`status-${order.status}`">
        {{ getStatusText(order.status) }}
      </text>
    </view>
    <view class="order-items">
      <view v-for="item in order.items" :key="item.id" class="order-item">
        <image
          class="item-image"
          :src="item.foodImage || '/static/logo.png'"
          mode="aspectFill"
        />
        <view class="item-info">
          <text class="item-name">{{ item.foodName }}</text>
          <text class="item-spec" v-if="item.spec">{{ item.spec }}</text>
          <view class="item-footer">
            <text class="item-price">¥{{ (item.price / 100).toFixed(2) }}</text>
            <text class="item-quantity">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="order-footer">
      <text class="order-time">{{
        formatTime(order.createdAt, "YYYY-MM-DD HH:mm")
      }}</text>
      <text class="order-total"
        >合计：¥{{ (order.finalPrice / 100).toFixed(2) }}</text
      >
    </view>
    <view class="order-actions" v-if="showActions">
      <button
        v-if="order.status === 'unpaid'"
        class="action-btn pay-btn"
        @click.stop="handlePay"
      >
        立即支付
      </button>
      <button
        v-if="order.status === 'unpaid' || order.status === 'paid'"
        class="action-btn cancel-btn"
        @click.stop="handleCancel"
      >
        取消订单
      </button>
      <button
        v-if="order.status === 'delivering'"
        class="action-btn track-btn"
        @click.stop="handleTrack"
      >
        查看物流
      </button>
      <button
        v-if="order.status === 'completed'"
        class="action-btn review-btn"
        @click.stop="handleReview"
      >
        评价
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Order, ORDER_STATUS_TEXT } from "../../types/order";
import { formatTime } from "../../utils/format";

interface Props {
  order: Order;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
});

const emit = defineEmits<{
  pay: [order: Order];
  cancel: [order: Order];
  track: [order: Order];
  review: [order: Order];
  click: [order: Order];
}>();

const handleCardClick = () => {
  emit("click", props.order);
};

const handlePay = () => {
  emit("pay", props.order);
};

const handleCancel = () => {
  emit("cancel", props.order);
};

const handleTrack = () => {
  emit("track", props.order);
};

const handleReview = () => {
  emit("review", props.order);
};

const getStatusText = (status: string) => {
  return ORDER_STATUS_TEXT[status as keyof typeof ORDER_STATUS_TEXT] || status;
};
</script>

<style scoped lang="scss">
.order-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    background: #fafafa;
  }
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.merchant-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.order-status {
  font-size: 26rpx;
}

.status-unpaid {
  color: #ff6b6b;
}

.status-paid,
.status-preparing {
  color: #ff9500;
}

.status-delivering {
  color: #667eea;
}

.status-completed {
  color: #52c41a;
}

.status-cancelled,
.status-refunded {
  color: #999999;
}

.order-items {
  margin-bottom: 20rpx;
}

.order-item {
  display: flex;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.item-spec {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.item-price {
  font-size: 26rpx;
  color: #ff6b6b;
}

.item-quantity {
  font-size: 24rpx;
  color: #999999;
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.order-time {
  font-size: 24rpx;
  color: #999999;
}

.order-total {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  border: none;

  &::after {
    border: none;
  }
}

.pay-btn {
  background: #ff6b6b;
  color: #ffffff;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666666;
}

.track-btn {
  background: #667eea;
  color: #ffffff;
}

.review-btn {
  background: #52c41a;
  color: #ffffff;
}
</style>
