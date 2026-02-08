<template>
  <view class="category-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索美食、商家"
          @confirm="handleSearch"
          @input="handleSearchInput"
        />
        <text class="search-btn" @click="handleSearch">搜索</text>
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="category-filter">
      <scroll-view class="category-scroll" scroll-x show-scrollbar="false">
        <view
          class="category-item"
          :class="{ active: isCategorySelected(category, index) }"
          v-for="(category, index) in categories"
          :key="'cat-' + index"
          @click="handleCategoryClick(category.id ?? '')"
        >
          <text>{{ category.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 美食列表 -->
    <view class="food-list">
      <FoodCard
        v-for="food in foodList"
        :key="(food as Food & { _id?: string })._id || food.id"
        :food="food"
        @click="handleFoodClick"
        @toggle-favorite="handleToggleFavorite"
      />
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <text class="load-more-text">加载中...</text>
    </view>
    <view class="no-more" v-else-if="foodList.length > 0">
      <text class="no-more-text">没有更多了</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && foodList.length === 0">
      <text class="empty-text">暂无美食</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onLoad, onReachBottom, onPullDownRefresh } from "@dcloudio/uni-app";
import FoodCard from "@/components/FoodCard/FoodCard.vue";
import {
  getFoodList,
  getFoodCategories,
  searchFood,
  toggleFavorite as apiToggleFavorite,
} from "@/api/food";
import { Food, FoodCategory } from "@/types/food";

const searchKeyword = ref("");
const categories = ref<FoodCategory[]>([]);
const selectedCategoryId = ref("");
const foodIdOf = (food: Food) =>
  (food as Food & { _id?: string })._id || food.id || "";

const foodList = ref<Food[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const loading = ref(false);

onLoad((options: any) => {
  if (options?.categoryId) {
    selectedCategoryId.value = options.categoryId;
  } else {
    selectedCategoryId.value = ""; // 默认选中「全部」
  }
  if (options?.from === "search") {
    // 聚焦搜索框
  }
});

// 规范化分类（后端可能返回 _id）
const normalizeCategory = (c: any) => ({
  ...c,
  id: c.id || c._id || "",
  name: c.name ?? "",
  index: c.index ?? 0,
});

// 获取分类
const fetchCategories = async () => {
  try {
    const data = (await getFoodCategories()) as any[];
    categories.value = [
      { id: "", name: "全部", index: 0 },
      ...(data || []).map(normalizeCategory),
    ];
  } catch (error) {
    console.error("获取分类失败:", error);
  }
};

// 获取美食列表
const fetchFoodList = async (page: number = 1) => {
  if (loading.value) return;

  loading.value = true;
  try {
    let response;
    if (searchKeyword.value) {
      response = await searchFood(searchKeyword.value, {
        page,
        pageSize: pageSize.value,
        categoryId: selectedCategoryId.value || undefined,
      });
    } else {
      response = await getFoodList({
        page,
        pageSize: pageSize.value,
        categoryId: selectedCategoryId.value || undefined,
      });
    }

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

// 搜索输入
const handleSearchInput = () => {
  // 可以添加防抖搜索
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchFoodList(1);
};

// 是否选中该分类（index 0 为「全部」，空字符串与 undefined 均视为「全部」）
const isCategorySelected = (category: FoodCategory, index: number) => {
  const current = selectedCategoryId.value ?? "";
  const id = category.id ?? "";
  // 第一项是「全部」，当未选任何分类时选中
  if (index === 0) return current === "" || current === id;
  return current === id;
};

// 分类点击
const handleCategoryClick = (categoryId: string) => {
  selectedCategoryId.value = categoryId ?? "";
  currentPage.value = 1;
  fetchFoodList(1);
};

// 美食点击
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

// 下拉刷新
onPullDownRefresh(async () => {
  currentPage.value = 1;
  await fetchFoodList(1);
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
.category-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.search-section {
  background: #ffffff;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  height: 72rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.search-btn {
  font-size: 28rpx;
  color: #667eea;
  margin-left: 20rpx;
}

.category-filter {
  background: #ffffff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.category-scroll {
  white-space: nowrap;
  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.category-item {
  display: inline-block;
  padding: 10rpx 30rpx;
  margin: 0 10rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  font-size: 26rpx;
  color: #666666;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
}

.food-list {
  padding: 0 30rpx;
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
