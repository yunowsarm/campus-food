<template>
  <view class="delivery-home">
    <!-- 骑手状态卡片 -->
    <view class="status-card">
      <view class="status-info">
        <text class="status-title">{{ userStore.userInfo?.nickName || '骑手' }}</text>
        <view class="status-actions">
          <text class="status-badge" :class="statusClass">{{ statusText }}</text>
          <text class="switch-role" @click="goRoleSelect">切换身份</text>
        </view>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        <text>待抢单</text>
        <text class="tab-count" v-if="pendingList.length > 0">{{ pendingList.length }}</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'mine' }"
        @click="activeTab = 'mine'"
      >
        <text>我的配送</text>
      </view>
    </view>

    <!-- 待抢单列表 -->
    <view class="content-section" v-show="activeTab === 'pending'">
      <view class="delivery-list">
        <view
          class="delivery-card"
          v-for="d in pendingList"
          :key="d._id || d.id || d.deliveryNo"
          @click="goDetail(d)"
        >
          <view class="card-header">
            <text class="delivery-no">{{ d.deliveryNo }}</text>
            <text class="fee">¥{{ ((d.fee || 0) / 100).toFixed(2) }}</text>
          </view>
          <view class="card-body">
            <view class="info-row">
              <text class="label">取餐</text>
              <text class="value">{{ merchantName(d) }} {{ d.pickupAddress || '' }}</text>
            </view>
            <view class="info-row">
              <text class="label">送达</text>
              <text class="value">{{ d.deliveryAddress || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="label">订单</text>
              <text class="value">{{ (d.orderIds || []).length }} 单</text>
            </view>
          </view>
          <view class="card-footer">
            <button class="btn-accept" size="mini" @click.stop="handleAccept(d)">抢单</button>
          </view>
        </view>
      </view>
      <view class="empty-state" v-if="!loading && pendingList.length === 0">
        <text class="empty-text">暂无待抢单</text>
      </view>
    </view>

    <!-- 我的配送 -->
    <view class="content-section" v-show="activeTab === 'mine'">
      <view class="delivery-list">
        <view
          class="delivery-card mine-card"
          v-for="d in myList"
          :key="d._id || d.id || d.deliveryNo"
          @click="goDetail(d)"
        >
          <view class="card-header">
            <text class="delivery-no">{{ d.deliveryNo }}</text>
            <text class="status-tag" :class="`status-${d.status}`">{{ getStatusText(d.status) }}</text>
          </view>
          <view class="card-body">
            <view class="info-row">
              <text class="label">取餐</text>
              <text class="value">{{ merchantName(d) }}</text>
            </view>
            <view class="info-row">
              <text class="label">送达</text>
              <text class="value">{{ d.deliveryAddress || '-' }}</text>
            </view>
          </view>
          <view class="card-footer">
            <text class="action-hint">点击查看详情</text>
          </view>
        </view>
      </view>
      <view class="empty-state" v-if="!loading && myList.length === 0">
        <text class="empty-text">暂无进行中配送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import {
  getDeliveryPendingList,
  getDeliveryList,
} from '@/api/deliveries'
import type { Delivery } from '@/api/deliveries'

const userStore = useUserStore()
const activeTab = ref<'pending' | 'mine'>('pending')
const pendingList = ref<Delivery[]>([])
const myList = ref<Delivery[]>([])
const loading = ref(false)

const statusText = computed(() => '空闲')
const statusClass = computed(() => 'idle')

const merchantName = (d: Delivery) => {
  const m = d.merchantId
  if (typeof m === 'object' && m?.name) return m.name
  return '-'
}

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

const fetchPending = async () => {
  try {
    loading.value = true
    const list = await getDeliveryPendingList()
    pendingList.value = Array.isArray(list) ? list : (list as any)?.list || []
  } catch (e) {
    console.error('获取待抢单失败', e)
    pendingList.value = []
  } finally {
    loading.value = false
  }
}

const fetchMine = async () => {
  try {
    loading.value = true
    const res = await getDeliveryList({ pageSize: 20 })
    const list = res?.list || []
    myList.value = list.filter(
      (d) => d.status !== 'completed' && d.status !== 'cancelled'
    )
  } catch (e) {
    console.error('获取我的配送失败', e)
    myList.value = []
  } finally {
    loading.value = false
  }
}

const loadAll = async () => {
  await Promise.all([fetchPending(), fetchMine()])
}

const goDetail = (d: Delivery) => {
  const id = d._id || d.id
  if (id) {
    uni.navigateTo({ url: `/pages/delivery/detail/index?id=${id}` })
  }
}

const handleAccept = async (d: Delivery) => {
  const id = d._id || d.id
  if (!id) return
  try {
    const { acceptDelivery } = await import('@/api/deliveries')
    await acceptDelivery(id)
    uni.showToast({ title: '抢单成功', icon: 'success' })
    loadAll()
    uni.navigateTo({ url: `/pages/delivery/detail/index?id=${id}` })
  } catch (e: any) {
    uni.showToast({ title: e?.message || '抢单失败', icon: 'none' })
  }
}

onShow(() => {
  if (userStore.role === 'delivery') {
    loadAll()
  }
})

onPullDownRefresh(async () => {
  await loadAll()
  uni.stopPullDownRefresh()
})

const goRoleSelect = () => {
  uni.navigateTo({ url: '/pages/auth/role-select' })
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped lang="scss">
.delivery-home {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.status-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 40rpx 30rpx;
  color: #fff;
}

.status-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.switch-role {
  font-size: 24rpx;
  opacity: 0.9;
  text-decoration: underline;
}

.status-title {
  font-size: 36rpx;
  font-weight: bold;
}

.status-badge {
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.3);

  &.idle {
    background: rgba(255, 255, 255, 0.3);
  }
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 30rpx;
  gap: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
  position: relative;

  &.active {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: #fff;
  }
}

.tab-count {
  position: absolute;
  top: 12rpx;
  right: 20%;
  background: #ff4444;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.content-section {
  padding: 20rpx 30rpx;
}

.delivery-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.delivery-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.delivery-no {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.fee {
  font-size: 32rpx;
  font-weight: bold;
  color: #4facfe;
}

.status-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;

  &.status-accepted {
    background: #e3f2fd;
    color: #1976d2;
  }
  &.status-picking {
    background: #fff3e0;
    color: #e65100;
  }
  &.status-delivering {
    background: #e8f5e9;
    color: #388e3c;
  }
}

.card-body {
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  margin-bottom: 12rpx;
  font-size: 26rpx;

  .label {
    width: 80rpx;
    color: #999;
    flex-shrink: 0;
  }
  .value {
    flex: 1;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-accept {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  border: none;

  &::after {
    border: none;
  }
}

.action-hint {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
