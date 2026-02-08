<template>
  <view class="food-edit">
    <view class="form-section">
      <!-- 菜品图片 -->
      <view class="form-item">
        <text class="label">菜品图片</text>
        <view class="image-upload">
          <view
            class="image-item"
            v-for="(img, index) in foodInfo.images"
            :key="index"
          >
            <image class="preview-image" :src="img" mode="aspectFill" />
            <text class="remove-btn" @click="handleRemoveImage(index)">×</text>
          </view>
          <view
            class="upload-btn"
            @click="handleUploadImage"
            v-if="foodInfo.images.length < 6"
          >
            <text class="upload-icon">+</text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
      </view>

      <!-- 菜品名称 -->
      <view class="form-item">
        <text class="label required">菜品名称</text>
        <input
          class="input"
          v-model="foodInfo.name"
          placeholder="请输入菜品名称"
        />
      </view>

      <!-- 分类 -->
      <view class="form-item">
        <text class="label">分类</text>
        <picker
          mode="selector"
          :range="categories"
          range-key="name"
          @change="handleCategoryChange"
        >
          <view class="picker">
            {{
              categories.find(
                (c) => (c.id || (c as any)._id) === foodInfo.categoryId
              )?.name || "请选择分类"
            }}
          </view>
        </picker>
      </view>

      <!-- 价格 -->
      <view class="form-item">
        <text class="label required">价格（元）</text>
        <input
          class="input"
          v-model="priceYuan"
          type="digit"
          placeholder="请输入价格"
          @blur="handlePriceBlur"
        />
      </view>

      <!-- 原价 -->
      <view class="form-item">
        <text class="label">原价（元）</text>
        <input
          class="input"
          v-model="originalPriceYuan"
          type="digit"
          placeholder="可选"
          @blur="handleOriginalPriceBlur"
        />
      </view>

      <!-- 库存 -->
      <view class="form-item">
        <text class="label">库存</text>
        <input
          class="input"
          v-model.number="foodInfo.stock"
          type="number"
          placeholder="请输入库存"
        />
      </view>

      <!-- 描述 -->
      <view class="form-item">
        <text class="label">菜品描述</text>
        <textarea
          class="textarea"
          v-model="foodInfo.description"
          placeholder="请输入菜品描述"
          maxlength="200"
        />
      </view>

      <!-- 标签 -->
      <view class="form-item">
        <text class="label">标签</text>
        <input
          class="input"
          v-model="tagsInput"
          placeholder="多个标签用逗号分隔，如：热销,推荐"
          @blur="handleTagsBlur"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="action-section">
      <button class="action-btn" @click="handleSave">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  getFoodDetail,
  getFoodCategories,
  createFood,
  updateFood,
} from "@/api/food";
import { getMerchantMe } from "@/api/merchants";
import { uploadSingle } from "@/api/upload";
import type { Food, FoodCategory, UpdateFoodParams } from "@/types/food";
import { useMerchantStore } from "@/stores/merchant";

const merchantStore = useMerchantStore();
const foodId = ref("");
const isEdit = computed(() => !!foodId.value);

const foodInfo = ref<Partial<Food>>({
  name: "",
  images: [],
  categoryId: "",
  price: 0,
  originalPrice: 0,
  stock: 0,
  description: "",
  tags: [],
  status: "on",
});

const categories = ref<FoodCategory[]>([]);
const priceYuan = ref("");
const originalPriceYuan = ref("");
const tagsInput = ref("");

onLoad((options) => {
  if (options.id) {
    foodId.value = options.id;
    loadFoodDetail();
  }
});

const loadFoodDetail = async () => {
  try {
    const data = await getFoodDetail(foodId.value);
    foodInfo.value = data;
    priceYuan.value = (data.price / 100).toFixed(2);
    if (data.originalPrice)
      originalPriceYuan.value = (data.originalPrice / 100).toFixed(2);
    if (data.tags) tagsInput.value = data.tags.join(",");
  } catch (error) {
    console.error("获取菜品详情失败:", error);
  }
};

const loadCategories = async () => {
  try {
    const merchantId = merchantStore.merchantId;
    const data = await getFoodCategories(
      merchantId ? { merchantId } : undefined
    );
    categories.value = data;
  } catch (error) {
    console.error("获取分类失败:", error);
  }
};

const handleUploadImage = () => {
  const remain = 6 - (foodInfo.value.images?.length ?? 0);
  if (remain <= 0) return;
  uni.chooseImage({
    count: remain,
    sizeType: ["compressed"],
    success: async (res) => {
      const paths: string[] = Array.isArray(res.tempFilePaths)
        ? res.tempFilePaths
        : [res.tempFilePaths];
      if (!paths.length) return;
      uni.showLoading({ title: "上传中..." });
      try {
        for (const p of paths) {
          const { url } = await uploadSingle(p);
          if (!foodInfo.value.images) foodInfo.value.images = [];
          foodInfo.value.images.push(url);
        }
        uni.hideLoading();
        uni.showToast({ title: "上传成功", icon: "success" });
      } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || "上传失败", icon: "none" });
      }
    },
  });
};

const handleRemoveImage = (index: number) => {
  foodInfo.value.images!.splice(index, 1);
};

const handleCategoryChange = (e: any) => {
  const idx = Number(e.detail.value);
  const cat = categories.value[idx];
  if (cat) {
    foodInfo.value.categoryId =
      (cat as FoodCategory & { _id?: string })._id || cat.id || "";
  }
};

const handlePriceBlur = () => {
  foodInfo.value.price = Math.round(Number(priceYuan.value) * 100);
};

const handleOriginalPriceBlur = () => {
  foodInfo.value.originalPrice = originalPriceYuan.value
    ? Math.round(Number(originalPriceYuan.value) * 100)
    : undefined;
};

const handleTagsBlur = () => {
  foodInfo.value.tags = tagsInput.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const handleSave = async () => {
  if (!foodInfo.value.name) {
    return uni.showToast({ title: "请输入菜品名称", icon: "none" });
  }
  handlePriceBlur();
  handleOriginalPriceBlur();
  handleTagsBlur();
  if (!foodInfo.value.price || foodInfo.value.price <= 0) {
    return uni.showToast({ title: "请输入正确的价格", icon: "none" });
  }
  let merchantId = merchantStore.merchantId;
  if (!merchantId) {
    try {
      const merchant = await getMerchantMe();
      if (merchant) {
        merchantStore.setMerchantInfo(merchant);
        merchantId = merchantStore.merchantId;
      }
    } catch (_) {}
    if (!merchantId) {
      return uni.showToast({
        title: "请先到「店铺设置」完善店铺信息",
        icon: "none",
      });
    }
  }
  try {
    const payload: UpdateFoodParams = {
      name: foodInfo.value.name,
      categoryId: foodInfo.value.categoryId || undefined,
      description: foodInfo.value.description,
      images: foodInfo.value.images || [],
      price: foodInfo.value.price,
      originalPrice: foodInfo.value.originalPrice,
      stock: foodInfo.value.stock ?? 0,
      tags: foodInfo.value.tags || [],
      status: foodInfo.value.status === "off" ? "off" : "on",
    };
    if (isEdit.value) {
      await updateFood(foodId.value, payload);
    } else {
      await createFood({ ...payload, merchantId });
    }
    uni.showToast({ title: "保存成功", icon: "success" });
    setTimeout(() => uni.navigateBack());
  } catch (error: any) {
    uni.showToast({ title: error.message || "保存失败", icon: "none" });
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped lang="scss">
.food-edit {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.form-section {
  background: #ffffff;
  padding: 30rpx;
  padding-right: 60rpx;
}

.form-item {
  margin-bottom: 40rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 20rpx;

  &.required::before {
    content: "*";
    color: #ff6b6b;
    margin-right: 4rpx;
  }
}

.input,
.textarea,
.picker {
  width: 98%;
  padding-top: 20rpx;
  padding-bottom: 20rpx;
  padding-left: 20rpx;
  padding-right: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.textarea {
  height: 200rpx;
}

.picker {
  display: flex;
  align-items: center;
  height: 72rpx;
}

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.remove-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff6b6b;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  line-height: 1;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #dddddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.upload-icon {
  font-size: 60rpx;
  color: #999999;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999999;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}
</style>
