<template>
  <view class="search-bar" @click="handleClick">
    <view class="search-input">
      <text class="search-icon">🔍</text>
      <text class="placeholder">{{ placeholder }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: '搜索美食、商家'
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped lang="scss">
.search-bar {
  padding: 20rpx 30rpx;
  background: #ffffff;
}

.search-input {
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.placeholder {
  font-size: 28rpx;
  color: #999999;
  flex: 1;
}
</style>
