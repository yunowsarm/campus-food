<template>
  <view class="food-detail-container">
    <!-- 图片轮播 -->
    <swiper class="image-swiper" indicator-dots>
      <swiper-item v-for="(image, index) in displayImages" :key="index">
        <image class="food-image" :src="image" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 基本信息 -->
    <view class="info-section">
      <view class="food-header">
        <text class="food-name">{{ food.name }}</text>
        <view class="header-actions">
          <view class="share-btn" @click="handleShare">
            <text class="share-text">分享</text>
          </view>
          <view class="favorite-btn" @click="handleToggleFavorite">
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
      <view class="food-meta">
        <text class="sales">月售{{ food.sales ?? 0 }}</text>
        <text class="merchant-name">{{ merchantName }}</text>
      </view>
      <view class="price-section">
        <text class="price">¥{{ (food.price / 100).toFixed(2) }}</text>
        <text v-if="food.originalPrice" class="original-price">
          ¥{{ (food.originalPrice / 100).toFixed(2) }}
        </text>
      </view>
    </view>

    <!-- 商家信息（点击头像或名称进入该商家菜品列表） -->
    <view class="merchant-section" v-if="merchantName || merchantLogo">
      <view
        class="merchant-header merchant-header-clickable"
        @click="goToMerchantFoods"
      >
        <image
          v-if="merchantLogo"
          class="merchant-logo"
          :src="merchantLogo"
          mode="aspectFill"
        />
        <view class="merchant-info">
          <text class="merchant-title">商家信息</text>
          <text class="merchant-name-text">{{ merchantName }}</text>
        </view>
      </view>
    </view>

    <!-- 店铺介绍（简介优先，无则显示地址） -->
    <view
      class="shop-intro-section"
      v-if="merchantDescription || merchantAddress"
    >
      <text class="shop-intro-title">店铺介绍</text>
      <text class="shop-intro-content">{{
        merchantDescription || merchantAddress
      }}</text>
      <text
        v-if="merchantDescription && merchantAddress"
        class="shop-intro-address"
        >地址：{{ merchantAddress }}</text
      >
    </view>

    <!-- 详细描述 -->
    <view class="description-section" v-if="food.description">
      <text class="description-title">商品详情</text>
      <text class="description-content">{{ food.description }}</text>
    </view>

    <!-- 用户评价 -->
    <view class="reviews-section" v-if="reviewsList.length > 0">
      <text class="reviews-title">用户评价 ({{ reviewsTotal }})</text>
      <view
        v-for="r in reviewsList"
        :key="r.id"
        class="review-item"
      >
        <image
          class="review-avatar"
          :src="r.user?.avatarUrl || '/static/cover/cover.png'"
          mode="aspectFill"
        />
        <view class="review-body">
          <view class="review-head">
            <text class="review-nick">{{ r.user?.nickName || "用户" }}</text>
            <text class="review-rating">{{ "★".repeat(r.rating) }}{{ "☆".repeat(5 - r.rating) }}</text>
          </view>
          <text class="review-content" v-if="r.content">{{ r.content }}</text>
          <view class="review-reply" v-if="r.reply">
            <text class="reply-label">商家回复：</text>
            <text class="reply-text">{{ r.reply }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button class="action-btn buy-alone-btn" @click="handleBuyAlone">
        单独购买
      </button>
      <button class="action-btn create-group-btn" @click="handleCreateGroup">
        发起拼单
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import { getFoodDetail, toggleFavorite } from "@/api/food";
import { getFoodReviews } from "@/api/review";
import type { ReviewItem } from "@/api/review";

/** 详情接口返回：merchantId 为 populate 对象 */
interface FoodDetailRow {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  description?: string;
  sales?: number;
  rating?: number;
  isFavorite?: boolean;
  merchantId?: {
    _id: string;
    name?: string;
    logo?: string;
    address?: string;
    description?: string;
  };
  categoryId?: string;
  status?: string;
  [key: string]: unknown;
}

const food = ref<FoodDetailRow>({
  _id: "",
  name: "",
  price: 0,
  images: [],
  sales: 0,
});

const foodId = ref("");
const reviewsList = ref<ReviewItem[]>([]);
const reviewsTotal = ref(0);

const displayImages = computed(() => {
  const imgs = food.value.images;
  return imgs?.length ? imgs : ["/static/logo.png"];
});

const merchantName = computed(() => {
  const m = food.value.merchantId;
  if (!m) return "";
  return typeof m === "object" && m !== null && "name" in m
    ? (m.name as string)
    : "";
});

const merchantLogo = computed(() => {
  const m = food.value.merchantId;
  if (!m || typeof m !== "object" || !("logo" in m)) return "";
  return (m.logo as string) || "";
});

const merchantAddress = computed(() => {
  const m = food.value.merchantId;
  if (!m || typeof m !== "object" || !("address" in m)) return "";
  return (m.address as string) || "";
});

const merchantDescription = computed(() => {
  const m = food.value.merchantId;
  if (!m || typeof m !== "object" || !("description" in m)) return "";
  return (m.description as string) || "";
});

const foodIdValue = computed(() => food.value._id || "");

const merchantIdValue = computed(() => {
  const m = food.value.merchantId;
  if (!m) return "";
  if (typeof m === "string") return m;
  return (m as { _id?: string })._id || "";
});

const goToMerchantFoods = () => {
  const id = merchantIdValue.value;
  const name = encodeURIComponent(merchantName.value || "店铺");
  if (!id) return;
  uni.navigateTo({
    url: `/pages/student/merchant-foods/index?merchantId=${id}&name=${name}`,
  });
};

onLoad((options) => {
  if (options.id) {
    foodId.value = options.id;
    fetchFoodDetail();
  }
});


const fetchFoodDetail = async () => {
  try {
    const data = (await getFoodDetail(
      foodId.value
    )) as unknown as FoodDetailRow;
    food.value = data;
    fetchReviews();
  } catch (error) {
    console.error("获取美食详情失败:", error);
    uni.showToast({ title: "加载失败", icon: "none" });
  }
};

const fetchReviews = async () => {
  if (!foodId.value) return;
  try {
    const res = await getFoodReviews(foodId.value, { page: 1, pageSize: 5 });
    reviewsList.value = res.list || [];
    reviewsTotal.value = res.total || 0;
  } catch {
    // ignore
  }
};

const handleToggleFavorite = async () => {
  try {
    const id = foodIdValue.value;
    if (!id) return;
    const res = await toggleFavorite(id);
    food.value.isFavorite = res.isFavorite;
    uni.showToast({
      title: res.isFavorite ? "已收藏" : "已取消收藏",
      icon: "none",
    });
  } catch (error) {
    console.error("收藏操作失败:", error);
    uni.showToast({ title: "操作失败", icon: "none" });
  }
};

const handleBuyAlone = () => {
  const id = foodIdValue.value;
  if (!id) return;
  uni.navigateTo({
    url: `/pages/student/order/pay?foodId=${id}&type=alone`,
  });
};

const handleCreateGroup = () => {
  const id = foodIdValue.value;
  if (!id) return;
  uni.navigateTo({
    url: `/pages/student/group/detail?foodId=${id}&action=create`,
  });
};

const handleShare = () => {
  // 触发右上角菜单分享（微信小程序）
  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true });
  uni.showToast({ title: "请点击右上角分享", icon: "none" });
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: "请使用右上角菜单分享", icon: "none" });
  // #endif
};

onShareAppMessage(() => {
  return {
    title: `${food.value.name} - ¥${((food.value.price || 0) / 100).toFixed(2)} | ${merchantName.value || "校园美食"}`,
    path: `/pages/student/food/detail?id=${foodIdValue.value}`,
    imageUrl: displayImages.value[0] || "",
  };
});
</script>

<style scoped lang="scss">
.food-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.image-swiper {
  width: 100%;
  height: 600rpx;
}

.food-image {
  width: 100%;
  height: 100%;
}

.info-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.food-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.food-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.share-btn .share-text {
  font-size: 28rpx;
  color: #667eea;
}

.favorite-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-icon {
  width: 48rpx;
  height: 48rpx;
}

.food-meta {
  display: flex;
  align-items: center;
  gap: 30rpx;
  margin-bottom: 20rpx;
}

.rating,
.sales,
.merchant-name {
  font-size: 26rpx;
  color: #666666;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 20rpx;
}

.price {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.original-price {
  font-size: 28rpx;
  color: #999999;
  text-decoration: line-through;
}

.merchant-section {
  background: #ffffff;
  padding: 30rpx;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.merchant-header-clickable {
  cursor: pointer;
}

.merchant-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.merchant-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.merchant-title {
  font-size: 26rpx;
  color: #999999;
}

.merchant-name-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.shop-intro-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.shop-intro-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 16rpx;
}

.shop-intro-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  display: block;
}

.shop-intro-address {
  font-size: 26rpx;
  color: #999999;
  margin-top: 16rpx;
  display: block;
}

.description-section {
  background: #ffffff;
  padding: 30rpx;
}

.description-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.description-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

.reviews-section {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.reviews-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 24rpx;
}

.review-item {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.review-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  flex-shrink: 0;
  background: #f0f0f0;
}

.review-body {
  flex: 1;
  min-width: 0;
}

.review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.review-nick {
  font-size: 26rpx;
  color: #333;
}

.review-rating {
  font-size: 24rpx;
  color: #ffb400;
}

.review-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  display: block;
}

.review-reply {
  margin-top: 12rpx;
  padding: 12rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.reply-label {
  font-size: 24rpx;
  color: #999;
}

.reply-text {
  font-size: 26rpx;
  color: #666;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }
}

.buy-alone-btn {
  background: #f5f5f5;
  color: #333333;
}

.create-group-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}
</style>
