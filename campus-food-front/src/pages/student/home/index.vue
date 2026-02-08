<template>
  <view class="home-container">
    <!-- 分类快捷入口 -->
    <view class="category-section">
      <view
        v-for="category in categories"
        :key="category.id || (category as any)._id"
        class="category-item"
        @click="handleCategoryClick(category)"
      >
        <text class="category-icon">{{ getCategoryIcon(category.name) }}</text>
        <text class="category-name">{{ category.name }}</text>
      </view>
    </view>

    <!-- 推荐美食 -->
    <view class="food-section">
      <view class="section-header">
        <text class="section-title">推荐美食</text>
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
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <text class="load-more-text">加载中...</text>
    </view>
    <view class="no-more" v-else-if="foodList.length > 0">
      <text class="no-more-text">没有更多了</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onReachBottom, onPullDownRefresh } from "@dcloudio/uni-app";
import SearchBar from "@/components/SearchBar/SearchBar.vue";
import FoodCard from "@/components/FoodCard/FoodCard.vue";
import {
  getFoodList,
  getFoodCategories,
  getRecommendations,
  toggleFavorite as apiToggleFavorite,
} from "@/api/food";
import { Food, FoodCategory } from "@/types/food";

const banners = ref<Array<{ image: string }>>([
  { image: "/static/banner1.jpg" },
  { image: "/static/banner2.jpg" },
]);

const categories = ref<FoodCategory[]>([]);
const foodList = ref<Food[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const loading = ref(false);

// 规范化分类 id（后端可能返回 _id）
const categoryIdOf = (c: FoodCategory & { _id?: string }) => c.id || c._id || "";

// 获取分类
const fetchCategories = async () => {
  try {
    const data = (await getFoodCategories()) as (FoodCategory & { _id?: string })[];
    categories.value = (data || []).slice(0, 8).map((c) => ({
      ...c,
      id: categoryIdOf(c),
      name: c.name ?? "",
      index: c.index ?? 0,
    }));
  } catch (error) {
    console.error("获取分类失败:", error);
  }
};

// 获取美食列表（首页第一页用推荐接口，其余用普通列表）
const fetchFoodList = async (page: number = 1) => {
  if (loading.value) return;

  loading.value = true;
  try {
    const isFirstPage = page === 1;
    const response = isFirstPage
      ? await getRecommendations({ page: 1, pageSize: pageSize.value })
      : await getFoodList({ page, pageSize: pageSize.value });

    if (page === 1) {
      foodList.value = response.list;
    } else {
      foodList.value.push(...response.list);
    }

    hasMore.value = response.list.length >= pageSize.value;
    currentPage.value = page;
  } catch (error) {
    console.error("获取美食列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 分类点击：跳转到分类页并选中该分类
const handleCategoryClick = (category: FoodCategory & { _id?: string }) => {
  const id = categoryIdOf(category);
  uni.navigateTo({
    url: `/pages/student/category/index?categoryId=${id}`,
  });
};

// 美食点击（后端返回 _id）
const foodIdOf = (food: Food) =>
  (food as Food & { _id?: string })._id || food.id || "";

const handleFoodClick = (food: Food) => {
  const id = foodIdOf(food);
  if (!id) return;
  uni.navigateTo({
    url: `/pages/student/food/detail?id=${id}`,
  });
};

// 卡片上点击收藏
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

// 获取分类图标
const getCategoryIcon = (name: string) => {
  const iconMap: Record<string, string> = {
    川菜: "🌶️",
    快餐: "🍱",
    面食: "🍜",
    小吃: "🍢",
    饮品: "🥤",
    甜品: "🍰",
    火锅: "🍲",
    烧烤: "🍢",
  };
  return iconMap[name] || "🍽️";
};

// 下拉刷新
onPullDownRefresh(async () => {
  currentPage.value = 1;
  await Promise.all([fetchCategories(), fetchFoodList(1)]);
  uni.stopPullDownRefresh();
});

// 上拉加载更多
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    fetchFoodList(currentPage.value + 1);
  }
});

onMounted(() => {
  fetchCategories();
  fetchFoodList(1);
});
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.banner-section {
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-swiper {
  height: 300rpx;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.category-section {
  background: #ffffff;
  padding: 30rpx 20rpx;
  display: flex;
  flex-wrap: wrap;
}

.category-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
  /* 防止出现横向滚动栏 */
  box-sizing: border-box;
  overflow: hidden;
  min-width: 0;
}

.category-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.category-name {
  font-size: 24rpx;
  color: #666666;
}

.food-section {
  margin: 20rpx 30rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.food-list {
  display: flex;
  flex-direction: column;
}

.load-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
}

.load-more-text,
.no-more-text {
  font-size: 26rpx;
  color: #999999;
}
</style>
