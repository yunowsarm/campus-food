<template>
  <view class="merchant-foods">
    <!-- 顶部操作栏 -->
    <view class="top-bar">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="keyword" 
          placeholder="搜索菜品"
          @confirm="handleSearch"
        />
      </view>
      <button class="add-btn" @click="handleAddFood">+ 新增菜品</button>
    </view>

    <!-- 分类筛选 -->
    <view class="category-filter">
      <scroll-view class="category-scroll" scroll-x show-scrollbar="false">
        <view 
          class="category-item"
          :class="{ active: selectedCategoryId === categoryIdOf(category) }"
          v-for="category in categories"
          :key="categoryIdOf(category)"
          @click="handleCategoryClick(categoryIdOf(category))"
        >
          <text>{{ category.name }}</text>
        </view>
      </scroll-view>
      <!-- <button class="category-manage-btn" size="mini" @click="goToCategoryManage">管理分类</button> -->
    </view>

    <!-- 菜品列表 -->
    <view class="food-list">
      <view 
        class="food-card" 
        v-for="food in foodList" 
        :key="foodIdOf(food)"
        @click="handleEditFood(foodIdOf(food))"
      >
        <image class="food-image" :src="(food.images && food.images[0]) || '/static/logo.png'" mode="aspectFill" />
        <view class="food-info">
          <text class="food-name">{{ food.name }}</text>
          <text class="food-price">¥{{ (food.price / 100).toFixed(2) }}</text>
          <text class="food-sales">已售 {{ food.sales }}</text>
        </view>
        <view class="food-actions">
          <switch 
            :checked="food.status === 'on'" 
            @change="handleStatusChange(foodIdOf(food), $event)"
            color="#667eea"
            @click.stop
          />
          <text class="status-text">{{ food.status === 'on' ? '已上架' : '已下架' }}</text>
          <span class="delete-btn" size="mini" @click.stop="handleDeleteFood(foodIdOf(food))">删除</span>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && foodList.length === 0">
      <text class="empty-text">暂无菜品</text>
      <button class="add-btn-empty" @click="handleAddFood">添加第一个菜品</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getFoodList, getFoodCategories, deleteFood, updateFood } from '@/api/food'
import { getMerchantMe } from '@/api/merchants'
import { useMerchantStore } from '@/stores/merchant'
import type { Food, FoodCategory } from '@/types/food'

const merchantStore = useMerchantStore()
const keyword = ref('')
const categories = ref<FoodCategory[]>([])
const selectedCategoryId = ref('')
const foodList = ref<Food[]>([])
const loading = ref(false)

/** 分类主键（后端为 _id） */
const categoryIdOf = (c: FoodCategory & { _id?: string }) => c._id ?? c.id ?? ''

const ensureMerchant = async () => {
  if (merchantStore.merchantId) return
  try {
    const info = await getMerchantMe({ silentError: true })
    if (info) merchantStore.setMerchantInfo(info)
  } catch {
    // 未创建店铺，列表不请求
  }
}

const fetchCategories = async () => {
  try {
    const params = merchantStore.merchantId ? { merchantId: merchantStore.merchantId } : undefined
    const data = await getFoodCategories(params)
    categories.value = [{ id: '', name: '全部', index: 0 }, ...data]
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const fetchFoodList = async (opts?: { showLoading?: boolean }) => {
  if (loading.value) return
  if (!merchantStore.merchantId) return
  loading.value = true
  const showLoading = opts?.showLoading !== false
  try {
    const res = await getFoodList(
      {
        merchantId: merchantStore.merchantId,
        categoryId: selectedCategoryId.value || undefined,
        keyword: keyword.value || undefined,
        pageSize: 100
      },
      showLoading ? undefined : { showLoading: false }
    )
    foodList.value = res.list
  } catch (error) {
    console.error('获取菜品列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchFoodList()
}

const handleCategoryClick = (categoryId: string) => {
  selectedCategoryId.value = categoryId
  fetchFoodList()
}

const handleAddFood = () => {
  uni.navigateTo({ url: '/pages/merchant/food-edit/index' })
}

const foodIdOf = (food: Food) => (food as Food & { _id?: string })._id || food.id || ''

const handleEditFood = (foodId: string) => {
  if (!foodId) return
  uni.navigateTo({ url: `/pages/merchant/food-edit/index?id=${foodId}` })
}

const handleStatusChange = async (foodId: string, e: any) => {
  const status = e.detail.value ? 'on' : 'off'
  try {
    await updateFood(foodId, { status })
    uni.showToast({ title: status === 'on' ? '已上架' : '已下架', icon: 'success' })
    fetchFoodList({ showLoading: false }) // 静默刷新，避免盖掉 toast
  } catch (error: any) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' })
  }
}

const handleDeleteFood = (foodId: string) => {
  if (!foodId) return
  uni.showModal({
    title: '确认删除',
    content: '删除后不可恢复，确定要删除该菜品吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        await deleteFood(foodId)
        uni.showToast({ title: '已删除', icon: 'success' })
        fetchFoodList({ showLoading: false })
      } catch (error: any) {
        uni.showToast({ title: error.message || '删除失败', icon: 'none' })
      }
    },
  })
}

const goToCategoryManage = () => {
  uni.navigateTo({ url: '/pages/merchant/category-manage/index' })
}

onShow(async () => {
  await ensureMerchant()
  await fetchCategories()
  fetchFoodList()
})

onPullDownRefresh(async () => {
  await Promise.all([fetchCategories(), fetchFoodList()])
  uni.stopPullDownRefresh()
})
</script>

<style scoped lang="scss">
.merchant-foods {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: #ffffff;
}

.search-box {
  flex: 1;
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
}

.add-btn {
  padding: 0 30rpx;
  height: 72rpx;
  line-height: 72rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.category-filter {
  display: flex;
  align-items: center;
  background: #ffffff;
  height: 80rpx;
  padding-bottom: 20rpx;
  margin-bottom: 20rpx;
}

.category-scroll {
  flex: 1;
  white-space: nowrap;
}

.category-item {
  display: inline-block;
  padding: 10rpx 27rpx;
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

.category-manage-btn {
  margin-right: 20rpx;
  background: #ffffff;
  color: #667eea;
  border: 1rpx solid #667eea;
  font-size: 24rpx;
}

.food-list {
  padding: 0 30rpx;
}

.food-card {
  display: flex;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.food-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.food-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.food-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.food-sales {
  font-size: 24rpx;
  color: #999999;
}

.food-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.status-text {
  font-size: 18rpx;
  color: #666666;
}

.delete-btn {
  margin-top: 8rpx;
  padding: 8rpx 20rpx;
  height: auto;
  line-height: 1.4;
  font-size: 24rpx;
  color: #ff6b6b;
  border-radius: 8rpx;
}

.empty-state {
  text-align: center;
  padding: 120rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
  display: block;
}

.add-btn-empty {
  display: inline-block;
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}
</style>
