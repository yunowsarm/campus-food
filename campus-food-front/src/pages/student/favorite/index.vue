<template>
  <view class="favorite-container">
    <!-- 标签切换 -->
    <view class="tabs-section">
      <view
        class="tab-item"
        :class="{ active: selectedTab === item.value }"
        v-for="item in tabs"
        :key="item.value"
        @click="selectedTab = item.value as 'food' | 'merchant'"
      >
        <text>{{ item.label }}</text>
      </view>
    </view>

    <!-- 收藏的美食 -->
    <view class="food-list" v-if="selectedTab === 'food'">
      <FoodCard
        v-for="food in favoriteFoods"
        :key="(food as Food & { _id?: string })._id || food.id"
        :food="food"
        @click="handleFoodClick"
        @toggle-favorite="handleToggleFavorite"
      />
    </view>

    <!-- 收藏的商家 -->
    <view class="merchant-list" v-if="selectedTab === 'merchant'">
      <view
        v-for="merchant in favoriteMerchants"
        :key="merchant.id"
        class="merchant-item"
        @click="handleMerchantClick(merchant)"
      >
        <image
          class="merchant-avatar"
          :src="merchant.avatar || '/static/cover/cover.png'"
          mode="aspectFill"
        />
        <view class="merchant-info">
          <text class="merchant-name">{{ merchant.name }}</text>
          <text class="merchant-desc">{{ merchant.description }}</text>
          <view class="merchant-meta">
            <text class="merchant-rating">⭐ {{ merchant.rating }}</text>
            <text class="merchant-distance">{{ merchant.distance }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view
      class="empty-state"
      v-if="
        (selectedTab === 'food' && favoriteFoods.length === 0) ||
        (selectedTab === 'merchant' && favoriteMerchants.length === 0)
      "
    >
      <text class="empty-text">暂无收藏</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FoodCard from "@/components/FoodCard/FoodCard.vue";
import { toggleFavorite as apiToggleFavorite } from "@/api/food";
import { Food } from "@/types/food";

const tabs = [
  { label: "美食", value: "food" },
  { label: "商家", value: "merchant" },
];

const selectedTab = ref<"food" | "merchant">("food");
const favoriteFoods = ref<Food[]>([]);
const favoriteMerchants = ref<
  Array<{
    id: string;
    name: string;
    avatar?: string;
    description: string;
    rating: number;
    distance: string;
  }>
>([]);

// 获取收藏的美食
const fetchFavoriteFoods = async () => {
  // TODO: 替换为实际接口
  favoriteFoods.value = [];
};

// 获取收藏的商家
const fetchFavoriteMerchants = async () => {
  // TODO: 替换为实际接口
  favoriteMerchants.value = [];
};

const foodIdOf = (food: Food) =>
  (food as Food & { _id?: string })._id || food.id || "";

const handleFoodClick = (food: Food) => {
  const id = foodIdOf(food);
  if (!id) return;
  uni.navigateTo({ url: `/pages/student/food/detail?id=${id}` });
};

const handleToggleFavorite = async (food: Food) => {
  const id = foodIdOf(food);
  if (!id) return;
  try {
    const res = await apiToggleFavorite(id);
    const f = favoriteFoods.value.find((x) => foodIdOf(x) === id);
    if (f) f.isFavorite = res.isFavorite;
    if (!res.isFavorite)
      favoriteFoods.value = favoriteFoods.value.filter(
        (x) => foodIdOf(x) !== id
      );
    uni.showToast({
      title: res.isFavorite ? "已收藏" : "已取消收藏",
      icon: "none",
    });
  } catch (e) {
    console.error("收藏操作失败:", e);
  }
};

// 商家点击
const handleMerchantClick = (merchant: any) => {
  uni.showToast({
    title: "商家详情功能待开发",
    icon: "none",
  });
};

onMounted(() => {
  fetchFavoriteFoods();
  fetchFavoriteMerchants();
});
</script>

<style scoped lang="scss">
.favorite-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.tabs-section {
  background: #ffffff;
  display: flex;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #666666;
  padding: 20rpx 0;
  position: relative;

  &.active {
    color: #667eea;
    font-weight: bold;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #667eea;
      border-radius: 2rpx;
    }
  }
}

.food-list {
  padding: 0 30rpx;
}

.merchant-list {
  padding: 0 30rpx;
}

.merchant-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.merchant-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
}

.merchant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.merchant-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.merchant-desc {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 10rpx;
}

.merchant-meta {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.merchant-rating {
  font-size: 24rpx;
  color: #ff9500;
}

.merchant-distance {
  font-size: 24rpx;
  color: #999999;
}

.empty-state {
  text-align: center;
  padding: 200rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
