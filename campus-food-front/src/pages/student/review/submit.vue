<template>
  <view class="submit-container">
    <view class="form-section">
      <view class="item">
        <text class="label">评分</text>
        <view class="stars">
          <text
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ active: n <= form.rating }"
            @click="form.rating = n"
          >
            {{ n <= form.rating ? "★" : "☆" }}
          </text>
        </view>
      </view>
      <view class="item">
        <text class="label">评价内容</text>
        <textarea
          v-model="form.content"
          class="textarea"
          placeholder="选填，分享你的体验"
          placeholder-class="placeholder"
          maxlength="500"
        />
      </view>
      <view class="item">
        <text class="label">晒单图片</text>
        <view class="images-wrap">
          <view
            v-for="(url, i) in form.images"
            :key="i"
            class="img-box"
          >
            <image class="img" :src="url" mode="aspectFill" />
            <text class="del" @click="removeImage(i)">×</text>
          </view>
          <view
            v-if="form.images.length < 9"
            class="add-img"
            @click="chooseImage"
          >
            <text class="add-text">+</text>
          </view>
        </view>
      </view>
    </view>
    <button class="submit-btn" @click="handleSubmit">提交评价</button>
  </view>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { createReview } from "@/api/review";
import { uploadSingle } from "@/api/upload";

const form = reactive({
  rating: 5,
  content: "",
  images: [] as string[],
});

let orderId = "";
let targetType: "food" | "merchant" = "food";
let targetId = "";

onLoad((options) => {
  orderId = options.orderId || "";
  targetType = (options.targetType as "food" | "merchant") || "food";
  targetId = options.targetId || "";
});

const chooseImage = () => {
  const left = 9 - form.images.length;
  if (left <= 0) return;
  uni.chooseImage({
    count: left,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      for (const tempPath of res.tempFilePaths) {
        try {
          uni.showLoading({ title: "上传中..." });
          const { url } = await uploadSingle(tempPath);
          form.images.push(url);
        } catch {
          uni.showToast({ title: "上传失败", icon: "none" });
        }
        uni.hideLoading();
      }
    },
  });
};

const removeImage = (i: number) => {
  form.images.splice(i, 1);
};

const handleSubmit = async () => {
  if (!orderId || !targetId) {
    uni.showToast({ title: "参数错误", icon: "none" });
    return;
  }
  try {
    uni.showLoading({ title: "提交中..." });
    await createReview({
      orderId,
      targetType,
      targetId,
      rating: form.rating,
      content: form.content.trim() || undefined,
      images: form.images.length ? form.images : undefined,
    });
    uni.hideLoading();
    uni.showToast({ title: "评价成功", icon: "success" });
    setTimeout(() => uni.navigateBack(), 500);
  } catch (e) {
    uni.hideLoading();
  }
};

onMounted(() => {
  uni.setNavigationBarTitle({ title: "写评价" });
});
</script>

<style scoped lang="scss">
.submit-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
}

.item {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.stars {
  display: flex;
  gap: 16rpx;
}

.star {
  font-size: 56rpx;
  color: #ddd;

  &.active {
    color: #ffb400;
  }
}

.textarea {
  width: 100%;
  min-height: 180rpx;
  font-size: 28rpx;
  color: #333;
}

.placeholder {
  color: #bbb;
}

.images-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.img-box {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}

.img {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
  background: #f0f0f0;
}

.del {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: #999;
  color: #fff;
  font-size: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-img {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-text {
  font-size: 48rpx;
  color: #999;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  &::after {
    border: none;
  }
}
</style>
