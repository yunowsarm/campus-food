<template>
  <view class="delivery-detail">
    <view class="detail-card" v-if="delivery">
      <view class="card-header">
        <text class="delivery-no">{{ delivery.deliveryNo }}</text>
        <text class="status-tag" :class="`status-${delivery.status}`">
          {{ getStatusText(delivery.status) }}
        </text>
      </view>

      <!-- 取餐信息 -->
      <view class="section">
        <text class="section-title">取餐信息</text>
        <view class="info-block">
          <text class="info-label">商家</text>
          <text class="info-value">{{ merchantName }}</text>
        </view>
        <view class="info-block">
          <text class="info-label">地址</text>
          <text class="info-value">{{ delivery.pickupAddress || '-' }}</text>
        </view>
      </view>

      <!-- 送达信息 -->
      <view class="section">
        <text class="section-title">送达信息</text>
        <view class="info-block">
          <text class="info-label">联系人</text>
          <text class="info-value">{{ delivery.contactName || '-' }}</text>
        </view>
        <view class="info-block">
          <text class="info-label">电话</text>
          <text class="info-value">{{ delivery.contactPhone || '-' }}</text>
        </view>
        <view class="info-block">
          <text class="info-label">地址</text>
          <text class="info-value">{{ delivery.deliveryAddress || '-' }}</text>
        </view>
      </view>

      <!-- 订单商品 -->
      <view class="section" v-if="orderItems.length > 0">
        <text class="section-title">商品明细</text>
        <view class="item" v-for="(it, idx) in orderItems" :key="idx">
          <text class="item-name">{{ it.foodName }} x{{ it.quantity }}</text>
        </view>
      </view>

      <!-- 配送费 -->
      <view class="section fee-section">
        <text class="section-title">配送费</text>
        <text class="fee-value">¥{{ ((delivery.fee || 0) / 100).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button
        v-if="delivery?.status === 'pending'"
        class="btn btn-primary"
        @click="handleAccept"
      >
        抢单
      </button>
      <button
        v-if="delivery?.status === 'accepted'"
        class="btn btn-primary"
        @click="handlePicking"
      >
        到店取餐
      </button>
      <button
        v-if="delivery?.status === 'picking'"
        class="btn btn-primary"
        @click="handleDelivering"
      >
        开始配送
      </button>
      <button
        v-if="delivery?.status === 'delivering'"
        class="btn btn-success"
        @click="handleComplete"
      >
        送达完成
      </button>
    </view>

    <view class="empty-tip" v-if="!loading && !delivery">
      <text>配送单不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  getDeliveryDetail,
  acceptDelivery,
  pickingDelivery,
  deliveringDelivery,
  completeDelivery,
} from '@/api/deliveries'
import type { Delivery } from '@/api/deliveries'

const delivery = ref<Delivery | null>(null)
const deliveryId = ref('')
const loading = ref(false)

const merchantName = computed(() => {
  const m = delivery.value?.merchantId
  if (typeof m === 'object' && m?.name) return m.name
  return '-'
})

const orderItems = computed(() => {
  const orders = delivery.value?.orderIds as any[]
  if (!Array.isArray(orders)) return []
  const items: { foodName: string; quantity: number }[] = []
  orders.forEach((o) => {
    (o?.items || []).forEach((it: any) => {
      items.push({
        foodName: it.foodName || '商品',
        quantity: it.quantity || 1,
      })
    })
  })
  return items
})

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待接单',
    accepted: '已接单',
    picking: '取餐中',
    delivering: '配送中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

const loadDetail = async () => {
  if (!deliveryId.value) return
  try {
    loading.value = true
    const data = await getDeliveryDetail(deliveryId.value)
    delivery.value = data
  } catch (e) {
    console.error('获取配送详情失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleAccept = async () => {
  try {
    await acceptDelivery(deliveryId.value)
    uni.showToast({ title: '抢单成功', icon: 'success' })
    loadDetail()
  } catch (e: any) {
    uni.showToast({ title: e?.message || '抢单失败', icon: 'none' })
  }
}

const handlePicking = async () => {
  try {
    await pickingDelivery(deliveryId.value)
    uni.showToast({ title: '已确认取餐', icon: 'success' })
    loadDetail()
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

const handleDelivering = async () => {
  try {
    await deliveringDelivery(deliveryId.value)
    uni.showToast({ title: '已开始配送', icon: 'success' })
    loadDetail()
  } catch (e: any) {
    uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
  }
}

const handleComplete = async () => {
  uni.showModal({
    title: '确认送达',
    content: '确认已将餐品送达用户？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await completeDelivery(deliveryId.value)
          uni.showToast({ title: '送达完成', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 1500)
        } catch (e: any) {
          uni.showToast({ title: e?.message || '操作失败', icon: 'none' })
        }
      }
    },
  })
}

onLoad((options) => {
  if (options.id) {
    deliveryId.value = options.id
    loadDetail()
  }
})

onMounted(() => {
  if (deliveryId.value) loadDetail()
})
</script>

<style scoped lang="scss">
.delivery-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

.detail-card {
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.delivery-no {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.status-tag {
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;

  &.status-pending {
    background: #fff3e0;
    color: #e65100;
  }
  &.status-accepted {
    background: #e3f2fd;
    color: #1976d2;
  }
  &.status-picking {
    background: #f3e5f5;
    color: #7b1fa2;
  }
  &.status-delivering {
    background: #e8f5e9;
    color: #388e3c;
  }
  &.status-completed {
    background: #e0e0e0;
    color: #616161;
  }
}

.section {
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.info-block {
  margin-bottom: 12rpx;
  font-size: 26rpx;

  .info-label {
    color: #999;
    margin-right: 16rpx;
  }
  .info-value {
    color: #333;
  }
}

.item {
  padding: 12rpx 0;
  font-size: 26rpx;
  color: #666;
}

.item-name {
  display: block;
}

.fee-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fee-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #4facfe;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.btn-success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  font-size: 28rpx;
  color: #999;
}
</style>
