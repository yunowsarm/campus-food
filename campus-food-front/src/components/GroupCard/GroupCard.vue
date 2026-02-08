<template>
  <view class="group-card" @click="handleClick">
    <image class="group-image" :src="group.foodImage || '/static/logo.png'" mode="aspectFill" />
    <view class="group-info">
      <view class="group-header">
        <text class="food-name">{{ group.foodName }}</text>
        <view class="delivery-tag" :class="`tag-${group.deliveryType}`">
          {{ getDeliveryTypeText(group.deliveryType) }}
        </view>
      </view>
      <view class="group-progress">
        <view class="progress-bar">
          <view 
            class="progress-fill" 
            :style="{ width: `${(group.currentNum / group.targetNum) * 100}%` }"
          ></view>
        </view>
        <text class="progress-text">{{ group.currentNum }}/{{ group.targetNum }}人</text>
      </view>
      <view class="group-footer">
        <view class="price-section">
          <text class="price">¥{{ (group.price / 100).toFixed(2) }}</text>
        </view>
        <view class="time-section">
          <text class="time-text">{{ formatCountdown(group.remainingTime || 0) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Group } from '../../types/group'
import { DELIVERY_TYPE_TEXT } from '../../utils/constants'
import { formatCountdown } from '../../utils/format'

interface Props {
  group: Group & { remainingTime?: number }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [group: Group]
}>()

const handleClick = () => {
  emit('click', props.group)
}

const getDeliveryTypeText = (type: string) => {
  return DELIVERY_TYPE_TEXT[type as keyof typeof DELIVERY_TYPE_TEXT] || type
}
</script>

<style scoped lang="scss">
.group-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
}

.group-image {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.group-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.food-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
}

.delivery-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-left: 10rpx;
}

.tag-alone {
  background: #e3f2fd;
  color: #1976d2;
}

.tag-together {
  background: #f3e5f5;
  color: #7b1fa2;
}

.tag-pickup {
  background: #fff3e0;
  color: #e65100;
}

.group-progress {
  margin-bottom: 15rpx;
}

.progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #666666;
}

.group-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-section {
  display: flex;
  align-items: baseline;
}

.price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.time-section {
  display: flex;
  align-items: center;
}

.time-text {
  font-size: 24rpx;
  color: #ff6b6b;
}
</style>
