<template>
  <view class="order-detail">
    <!-- 订单状态 -->
    <view class="status-section">
      <text class="status-icon">{{ getStatusIcon(order?.status) }}</text>
      <text class="status-text">{{ getStatusText(order?.status) }}</text>
    </view>

    <!-- 订单信息 -->
    <view class="info-section">
      <view class="info-row">
        <text class="label">订单号</text>
        <text class="value">{{ order?.orderNo }}</text>
      </view>
      <view class="info-row">
        <text class="label">下单时间</text>
        <text class="value">{{ formatTime(order?.createdAt) }}</text>
      </view>
      <view class="info-row">
        <text class="label">配送方式</text>
        <text class="value">{{ getDeliveryText(order?.deliveryType) }}</text>
      </view>
      <view class="info-row" v-if="order?.address">
        <text class="label">送达地址</text>
        <text class="value">{{ order?.address }}</text>
      </view>
      <view class="info-row" v-if="order?.contactName">
        <text class="label">联系人</text>
        <text class="value">{{ order?.contactName }} {{ order?.contactPhone }}</text>
      </view>
      <view class="info-row" v-if="order?.remark">
        <text class="label">备注</text>
        <text class="value">{{ order?.remark }}</text>
      </view>
      <view class="info-row refund-row" v-if="order?.refundStatus === 'pending'">
        <text class="label">退款申请</text>
        <text class="value refund-reason">{{ order?.refundReason || '用户申请退款' }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="items-section">
      <text class="section-title">商品清单</text>
      <view class="item" v-for="item in order?.items" :key="item.id">
        <image class="item-image" :src="item.foodImage" mode="aspectFill" />
        <view class="item-info">
          <text class="item-name">{{ item.foodName }}</text>
          <text class="item-spec" v-if="item.spec">{{ item.spec }}</text>
          <text class="item-price">¥{{ (item.price / 100).toFixed(2) }} x{{ item.quantity }}</text>
        </view>
      </view>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-row">
        <text class="label">商品总价</text>
        <text class="value">¥{{ ((order?.totalPrice || 0) / 100).toFixed(2) }}</text>
      </view>
      <view class="price-row">
        <text class="label">配送费</text>
        <text class="value">¥{{ ((order?.deliveryFee || 0) / 100).toFixed(2) }}</text>
      </view>
      <view class="price-row total">
        <text class="label">实付金额</text>
        <text class="value">¥{{ ((order?.finalPrice || 0) / 100).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <template v-if="order?.refundStatus === 'pending'">
        <button class="action-btn reject" @click="handleRejectRefund">拒绝退款</button>
        <button class="action-btn approve" @click="handleApproveRefund">同意退款</button>
      </template>
      <template v-else>
        <button 
          v-if="order?.status === 'paid'" 
          class="action-btn primary"
          @click="handleStartPreparing"
        >
          开始备餐
        </button>
        <button 
          v-if="order?.status === 'preparing'" 
          class="action-btn success"
          @click="handleFinishPreparing"
        >
          出餐完成
        </button>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, startPreparing, finishPreparing, approveRefund, rejectRefund } from '@/api/order'
import type { Order } from '@/types/order'

const orderId = ref('')
const order = ref<Order | null>(null)

onLoad((options) => {
  if (options.id) {
    orderId.value = options.id
    loadOrderDetail()
  }
})

const loadOrderDetail = async () => {
  try {
    order.value = await getOrderDetail(orderId.value)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const getStatusIcon = (status?: string) => {
  const map: Record<string, string> = {
    paid: '⏰',
    preparing: '👨‍🍳',
    delivering: '🚴',
    completed: '✅'
  }
  return map[status || ''] || '📦'
}

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    paid: '待接单',
    preparing: '备餐中',
    delivering: '配送中',
    completed: '已完成'
  }
  return map[status || ''] || status
}

const getDeliveryText = (type?: string) => {
  const map: Record<string, string> = {
    alone: '单独配送',
    together: '拼单配送',
    pickup: '到店自取'
  }
  return map[type || ''] || type
}

const formatTime = (time?: string) => {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const handleStartPreparing = async () => {
  try {
    await startPreparing(orderId.value)
    uni.showToast({ title: '已开始备餐', icon: 'success' })
    loadOrderDetail()
  } catch (error: any) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' })
  }
}

const handleFinishPreparing = async () => {
  try {
    await finishPreparing(orderId.value)
    uni.showToast({ title: '出餐完成', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error: any) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' })
  }
}

const handleApproveRefund = async () => {
  try {
    await approveRefund(orderId.value)
    uni.showToast({ title: '已同意退款', icon: 'success' })
    loadOrderDetail()
  } catch (error: any) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' })
  }
}

const handleRejectRefund = async () => {
  uni.showModal({
    title: '确认拒绝',
    content: '确定拒绝该退款申请吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await rejectRefund(orderId.value)
          uni.showToast({ title: '已拒绝', icon: 'success' })
          loadOrderDetail()
        } catch (error: any) {
          uni.showToast({ title: error.message || '操作失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style scoped lang="scss">
.order-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.status-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx;
  text-align: center;
  color: #ffffff;
}

.status-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.status-text {
  font-size: 36rpx;
  font-weight: bold;
}

.info-section,
.items-section,
.price-section {
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
  display: block;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 28rpx;
  color: #999999;
}

.value {
  font-size: 28rpx;
  color: #333333;
  text-align: right;
  flex: 1;
  margin-left: 20rpx;
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
}

.item-price {
  font-size: 26rpx;
  color: #666666;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  
  &.total {
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .label,
    .value {
      font-size: 32rpx;
      font-weight: bold;
      color: #ff6b6b;
    }
  }
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
  
  &.primary {
    background: #667eea;
    color: #ffffff;
  }
  
  &.success {
    background: #52c41a;
    color: #ffffff;
  }

  &.reject {
    flex: 1;
    background: #f5f5f5;
    color: #666;
  }

  &.approve {
    flex: 1;
    background: #52c41a;
    color: #fff;
  }
}

.refund-row .refund-reason {
  color: #ff9500;
}

.action-section {
  display: flex;
  gap: 20rpx;
}
</style>
