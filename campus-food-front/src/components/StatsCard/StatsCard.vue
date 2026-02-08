<template>
  <view class="stats-card" :class="type">
    <view class="stats-content">
      <text class="stats-label">{{ label }}</text>
      <text class="stats-value">{{ value }}</text>
      <text class="stats-trend" v-if="trend">{{ trend }}</text>
    </view>
    <text class="stats-icon">{{ icon }}</text>
  </view>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  icon?: string
  trend?: string
  type?: 'default' | 'primary' | 'success' | 'warning'
}

withDefaults(defineProps<Props>(), {
  icon: '📊',
  type: 'default'
})
</script>

<style scoped lang="scss">
.stats-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #ffffff;
  border-radius: 16rpx;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    
    .stats-label,
    .stats-value,
    .stats-trend {
      color: #ffffff;
    }
  }
  
  &.success {
    background: linear-gradient(135deg, #52c41a 0%, #38a169 100%);
    color: #ffffff;
    
    .stats-label,
    .stats-value,
    .stats-trend {
      color: #ffffff;
    }
  }
}

.stats-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.stats-label {
  font-size: 26rpx;
  color: #999999;
}

.stats-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
}

.stats-trend {
  font-size: 24rpx;
  color: #52c41a;
}

.stats-icon {
  font-size: 80rpx;
  opacity: 0.3;
}
</style>
