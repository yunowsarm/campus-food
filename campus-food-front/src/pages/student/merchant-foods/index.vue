<template>
  <view class="merchant-foods-container">
    <view class="merchant-header" v-if="merchantName">
      <text class="merchant-title">{{ merchantName }}的菜品</text>
    </view>

    <view class="food-list">
      <FoodCard
        v-for="food in foodList"
        :key="(food as Food & { _id?: string })._id || food.id"
        :food="food"
        @click="handleFoodClick"
        @toggle-favorite="handleToggleFavorite"
      />
    </view>

    <view class="load-more" v-if="loading && foodList.length > 0">
      <text class="load-more-text">加载中...</text>
    </view>
    <view
      class="no-more"
      v-else-if="!loading && foodList.length > 0 && !hasMore"
    >
      <text class="no-more-text">没有更多了</text>
    </view>

    <view class="empty-state" v-if="!loading && foodList.length === 0">
      <text class="empty-text">该商家暂无在售菜品</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  onLoad,
  onReachBottom,
  onPullDownRefresh,
  onShareAppMessage,
} from "@dcloudio/uni-app";
import FoodCard from "@/components/FoodCard/FoodCard.vue";
import { getFoodList, toggleFavorite as apiToggleFavorite } from "@/api/food";
import type { Food } from "@/types/food";

const merchantId = ref("");
const merchantName = ref("");
const foodList = ref<Food[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const hasMore = ref(true);
const loading = ref(false);

onLoad((options) => {
  merchantId.value = options.merchantId || "";
  merchantName.value = decodeURIComponent(options.name || "店铺");
  if (merchantName.value) {
    uni.setNavigationBarTitle({ title: merchantName.value });
  }
});

const fetchFoodList = async (page: number = 1) => {
  if (!merchantId.value) return;
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await getFoodList({
      merchantId: merchantId.value,
      page,
      pageSize: pageSize.value,
    });
    if (page === 1) {
      foodList.value = res.list;
    } else {
      foodList.value.push(...res.list);
    }
    hasMore.value = res.list.length >= pageSize.value;
    currentPage.value = page;
  } catch (error) {
    console.error("获取商家菜品失败:", error);
  } finally {
    loading.value = false;
  }
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
    const f = foodList.value.find((x) => foodIdOf(x) === id);
    if (f) f.isFavorite = res.isFavorite;
    uni.showToast({
      title: res.isFavorite ? "已收藏" : "已取消收藏",
      icon: "none",
    });
  } catch (e) {
    console.error("收藏操作失败:", e);
  }
};

onPullDownRefresh(async () => {
  currentPage.value = 1;
  await fetchFoodList(1);
  uni.stopPullDownRefresh();
});

onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    fetchFoodList(currentPage.value + 1);
  }
});

onMounted(() => {
  if (merchantId.value) fetchFoodList(1);
});

onShareAppMessage(() => {
  return {
    title: `${merchantName.value} - 校园美食`,
    path: `/pages/student/merchant-foods/index?merchantId=${
      merchantId.value
    }&name=${encodeURIComponent(merchantName.value)}`,
  };
});
</script>

<style scoped lang="scss">
.merchant-foods-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx 30rpx 40rpx;
}

.merchant-header {
  background: #ffffff;
  padding: 24rpx 0;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}

.merchant-title {
  padding: 0 30rpx;
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
}

.food-list {
  margin-bottom: 20rpx;
}

.load-more,
.no-more {
  text-align: center;
  padding: 24rpx;
}

.load-more-text,
.no-more-text {
  font-size: 26rpx;
  color: #999999;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
