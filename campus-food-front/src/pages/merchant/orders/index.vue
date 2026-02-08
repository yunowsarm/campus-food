<template>
  <view class="merchant-orders">
    <!-- 订单状态筛选 -->
    <view class="status-tabs">
      <view 
        class="tab-item"
        :class="{ active: activeStatus === status.key }"
        v-for="status in statusList"
        :key="status.key"
        @click="handleStatusChange(status.key)"
      >
        <text class="tab-label">{{ status.label }}</text>
        <text class="tab-badge" v-if="status.count > 0">{{ status.count }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view 
        class="order-card" 
        v-for="order in orderList" 
        :key="order.id"
        @click="handleOrderClick(order.id)"
      >
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-time">{{ formatTime(order.createdAt) }}</text>
        </view>
        
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

        <view class="order-footer">
          <view class="order-info">
            <text class="delivery-type">{{ getDeliveryText(order.deliveryType) }}</text>
            <text class="order-price">合计：¥{{ (order.finalPrice / 100).toFixed(2) }}</text>
          </view>
          <view class="order-actions">
            <button 
              v-if="order.status === 'paid'" 
              class="btn btn-primary" 
              size="mini"
              @click.stop="handleStartPreparing(order.id || order._id)"
            >
              开始备餐
            </button>
            <button 
              v-if="order.status === 'preparing'" 
              class="btn btn-success" 
              size="mini"
              @click.stop="handleFinishPreparing(order.id || order._id)"
            >
              出餐完成
            </button>
          </view>
        </view>
      </view>
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
import { ref, computed, onMounted } from 'vue'
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { getOrderList, startPreparing, finishPreparing } from '@/api/order'
import type { Order } from '@/types/order'

const activeStatus = ref('')
const orderList = ref<Order[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const loading = ref(false)

const statusList = ref([
  { key: '', label: '全部', count: 0 },
  { key: 'paid', label: '待接单', count: 0 },
  { key: 'preparing', label: '备餐中', count: 0 },
  { key: 'delivering', label: '配送中', count: 0 },
  { key: 'completed', label: '已完成', count: 0 }
])

const fetchOrderList = async (page: number = 1) => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await getOrderList({
      page,
      pageSize: pageSize.value,
      status: activeStatus.value || undefined
    })
    if (page === 1) {
      orderList.value = res.list
    } else {
      orderList.value.push(...res.list)
    }
    hasMore.value = res.list.length >= pageSize.value
    currentPage.value = page
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleStatusChange = (status: string) => {
  activeStatus.value = status
  currentPage.value = 1
  fetchOrderList(1)
}

const handleOrderClick = (orderId: string | undefined) => {
  if (!orderId) return
  uni.navigateTo({ url: `/pages/merchant/order-detail/index?id=${orderId}` })
}

const handleStartPreparing = async (orderId: string | undefined) => {
  if (!orderId) return
  try {
    await startPreparing(orderId)
    uni.showToast({ title: '已开始备餐', icon: 'success' })
    fetchOrderList(1)
  } catch (error: any) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' })
  }
}

const handleFinishPreparing = async (orderId: string | undefined) => {
  if (!orderId) return
  try {
    await finishPreparing(orderId)
    uni.showToast({ title: '出餐完成', icon: 'success' })
    fetchOrderList(1)
  } catch (error: any) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' })
  }
}

const formatTime = (time: string) => {
  const d = new Date(time)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}

const getDeliveryText = (type: string) => {
  const map: Record<string, string> = {
    alone: '单独配送',
    together: '拼单配送',
    pickup: '到店自取'
  }
  return map[type] || type
}

onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    fetchOrderList(currentPage.value + 1)
  }
})

onPullDownRefresh(async () => {
  currentPage.value = 1
  await fetchOrderList(1)
  uni.stopPullDownRefresh()
})

onMounted(() => {
  fetchOrderList(1)
})
</script>

<style scoped lang="scss">
.merchant-orders {
  min-height: 100vh;
  background: #f5f5f5;
}

.status-tabs {
  display: flex;
  background: #ffffff;
  padding: 20rpx 0;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-item {
  flex-shrink: 0;
  position: relative;
  padding: 10rpx 30rpx;
  margin: 0 10rpx;
  font-size: 28rpx;
  color: #666666;
  border-radius: 30rpx;
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
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

.order-list {
  padding: 20rpx 30rpx;
}

.order-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-no {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.order-time {
  font-size: 24rpx;
  color: #999999;
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

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.delivery-type {
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

.btn {
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
