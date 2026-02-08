<template>
  <view class="food-card" @click="handleClick">
    <view class="food-image-wrap">
      <image
        class="food-image"
        :src="food.images[0] || '/static/logo.png'"
        mode="aspectFill"
      />
    </view>
    <view class="food-info">
      <text class="food-name">{{ food.name }}</text>
      <view class="food-meta">
        <text class="merchant-name">{{ food.merchantName }}</text>
        <text class="sales">月售{{ food.sales }}</text>
      </view>
      <view class="food-footer">
        <view class="price-section">
          <text class="price">¥{{ (food.price / 100).toFixed(2) }}</text>
          <text v-if="food.originalPrice" class="original-price"
            >¥{{ (food.originalPrice / 100).toFixed(2) }}</text
          >
        </view>
        <view
          class="favorite-btn"
          @tap.stop="handleToggleFavorite"
          @click.stop="handleToggleFavorite"
        >
          <image
            class="favorite-icon"
            :src="
              food.isFavorite
                ? '/static/star/yishoucang.png'
                : '/static/star/weishoucang.png'
            "
            mode="aspectFit"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Food } from "../../types/food";

interface Props {
  food: Food;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [food: Food];
  toggleFavorite: [food: Food];
}>();

const handleClick = () => {
  emit("click", props.food);
};

const handleToggleFavorite = () => {
  emit("toggleFavorite", props.food);
};
</script>

<style scoped lang="scss">
.food-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.food-image {
  width: 100%;
  height: 350rpx;
}

.favorite-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-icon {
  width: 48rpx;
  height: 48rpx;
}

.food-info {
  padding: 20rpx;
}

.food-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.food-meta {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.merchant-name {
  font-size: 24rpx;
  color: #666666;
  margin-right: 20rpx;
}

.sales {
  font-size: 24rpx;
  color: #999999;
}

.food-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-section {
  display: flex;
  align-items: baseline;
}

.price {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
  margin-right: 10rpx;
}

.original-price {
  font-size: 24rpx;
  color: #999999;
  text-decoration: line-through;
}
</style>
