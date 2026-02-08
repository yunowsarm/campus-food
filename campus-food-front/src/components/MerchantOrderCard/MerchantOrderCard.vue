<template>
  <view class="merchant-order-card" @click="handleClick">
    <!-- 订单头部 -->
    <view class="order-header">
      <text class="order-no">订单号：{{ order.orderNo }}</text>
      <text class="order-status" :class="`status-${order.status}`">
        {{ getStatusText(order.status) }}
      </text>
    </view>

    <!-- 商品列表 -->
    <view class="order-items">
      <view class="item" v-for="item in order.items" :key="item.id">
        <image class="item-image" :src="item.foodImage" mode="aspectFill" />
        <view class="item-info">
          <text class="item-name">{{ item.foodName }}</text>
          <text class="item-spec" v-if="item.spec">{{ item.spec }}</text>
          <text class="item-price">¥{{ (item.price / 100).toFixed(2) }} x{{ item.quantity }}</text>
        </view>
      </view>
    </view>

    <!-- 配送信息 -->
    <view class="delivery-info" v-if="order.address">
      <text class="delivery-label">{{ getDeliveryText(order.deliveryType) }}</text>
      <text class="delivery-address">{{ order.address }}</text>
    </view>

    <!-- 订单底部 -->
    <view class="order-footer">
      <view class="order-price-info">
        <text class="order-time">{{ formatTime(order.createdAt) }}</text>
        <text class="order-price">合计：¥{{ (order.finalPrice / 100).toFixed(2) }}</text>
      </view>
      <view class="order-actions" @click.stop>
        <button 
          v-if="order.status === 'paid'" 
          class="action-btn btn-primary" 
          size="mini"
          @click="$emit('startPreparing', order.id || order._id)"
        >
          开始备餐
        </button>
        <button 
          v-if="order.status === 'preparing'" 
          class="action-btn btn-success" 
          size="mini"
          @click="$emit('finishPreparing', order.id || order._id)"
        >
          出餐完成
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Order } from '@/types/order'

interface Props {
  order: Order
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [order: Order]
  startPreparing: [orderId: string]
  finishPreparing: [orderId: string]
}>()

const handleClick = () => {
  emit('click', props.order)
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    unpaid: '待支付',
    paid: '待接单',
    preparing: '备餐中',
    delivering: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getDeliveryText = (type: string) => {
  const map: Record<string, string> = {
    alone: '🚴 单独配送',
    together: '🧑‍🤝‍🧑 拼单配送',
    pickup: '🏪 到店自取'
  }
  return map[type] || type
}

const formatTime = (time: string) => {
  const d = new Date(time)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}
</script>

<style scoped lang="scss">
.merchant-order-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
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
  
  &.status-delivering {
    background: #e8f5e9;
    color: #4caf50;
  }
  
  &.status-completed {
    background: #f5f5f5;
    color: #999999;
  }
}

.order-items {
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.item {
  display: flex;
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

.item-spec {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
}

.item-price {
  font-size: 26rpx;
  color: #666666;
  margin-top: 4rpx;
}

.delivery-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.delivery-label {
  font-size: 26rpx;
  color: #667eea;
}

.delivery-address {
  font-size: 26rpx;
  color: #666666;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.order-price-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999999;
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

.action-btn {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  border: none;
  
  &.btn-primary {
    background: #667eea;
    color: #ffffff;
  }
  
  &.btn-success {
    background: #52c41a;
    color: #ffffff;
  }
}
</style>
