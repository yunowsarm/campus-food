<template>
  <view class="merchant-shop">
    <!-- 店铺头图 -->
    <view class="shop-banner">
      <image
        class="banner-image"
        :src="shopInfo.logo || '/static/logo.png'"
        mode="aspectFill"
      />
      <button class="edit-banner-btn" size="mini" @click="handleUploadLogo">
        更换 logo
      </button>
    </view>

    <!-- 店铺信息表单 -->
    <view class="form-section">
      <view class="form-item">
        <text class="label">店铺名称</text>
        <input
          class="input"
          v-model="shopInfo.name"
          placeholder="请输入店铺名称"
        />
      </view>

      <view class="form-item">
        <text class="label">经营类目</text>
        <input
          class="input"
          v-model="shopInfo.category"
          placeholder="如：川菜、快餐"
        />
      </view>

      <view class="form-item">
        <text class="label">店铺简介</text>
        <textarea
          class="textarea"
          v-model="shopInfo.description"
          placeholder="请输入店铺简介"
          maxlength="200"
        />
      </view>

      <view class="form-item">
        <text class="label">店铺地址</text>
        <input
          class="input"
          v-model="shopInfo.address"
          placeholder="请输入店铺地址"
        />
      </view>

      <view class="form-item">
        <text class="label">联系人</text>
        <input
          class="input"
          v-model="shopInfo.contactName"
          placeholder="请输入联系人"
        />
      </view>

      <view class="form-item">
        <text class="label">联系电话</text>
        <input
          class="input"
          v-model="shopInfo.contactPhone"
          type="number"
          placeholder="请输入联系电话"
        />
      </view>

      <view class="form-item">
        <text class="label">营业时间</text>
        <input
          class="input"
          v-model="shopInfo.businessHours"
          placeholder="如：9:00-22:00"
        />
      </view>

      <view class="form-item">
        <text class="label">营业状态</text>
        <picker
          mode="selector"
          :range="statusOptions"
          range-key="label"
          @change="handleStatusChange"
        >
          <view class="picker">
            {{
              statusOptions.find((s) => s.value === shopInfo.status)?.label ||
              "请选择"
            }}
          </view>
        </picker>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" @click="handleSave">保存修改</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useMerchantStore } from "@/stores/merchant";
import { getMerchantMe, createMerchant, updateMerchant } from "@/api/merchants";
import { uploadSingle } from "@/api/upload";
import type { Merchant } from "@/types/merchant";

const merchantStore = useMerchantStore();

const shopInfo = ref<Partial<Merchant>>({
  name: "",
  logo: "",
  category: "",
  description: "",
  address: "",
  contactName: "",
  contactPhone: "",
  businessHours: "",
  status: "open",
});

const statusOptions = [
  { value: "open", label: "营业中" },
  { value: "closed", label: "已打烊" },
  { value: "rest", label: "休息中" },
];

const loadShopInfo = async () => {
  try {
    const merchant = await getMerchantMe({ silentError: true });
    if (merchant) {
      merchantStore.setMerchantInfo(merchant);
      shopInfo.value = {
        name: merchant.name,
        logo: merchant.logo,
        category: merchant.category,
        description: merchant.description,
        address: merchant.address,
        contactName: merchant.contactName,
        contactPhone: merchant.contactPhone,
        businessHours: merchant.businessHours,
        status: merchant.status ?? "open",
      };
    } else if (merchantStore.merchantInfo) {
      shopInfo.value = { ...merchantStore.merchantInfo };
    }
  } catch (error) {
    if (merchantStore.merchantInfo) {
      shopInfo.value = { ...merchantStore.merchantInfo };
    }
  }
};

const handleUploadLogo = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    success: async (res) => {
      const tempPath = res.tempFilePaths?.[0];
      if (!tempPath) return;
      try {
        uni.showLoading({ title: "上传中..." });
        const { url } = await uploadSingle(tempPath);
        shopInfo.value.logo = url;
        uni.hideLoading();
        uni.showToast({ title: "上传成功", icon: "success" });
      } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || "上传失败", icon: "none" });
      }
    },
  });
};

const handleStatusChange = (e: any) => {
  shopInfo.value.status = statusOptions[e.detail.value].value as
    | "open"
    | "closed"
    | "rest";
};

const handleSave = async () => {
  if (!shopInfo.value.name?.trim()) {
    return uni.showToast({ title: "请输入店铺名称", icon: "none" });
  }
  try {
    const id = merchantStore.merchantId;
    const payload = {
      name: shopInfo.value.name,
      logo: shopInfo.value.logo,
      category: shopInfo.value.category,
      description: shopInfo.value.description,
      address: shopInfo.value.address,
      contactName: shopInfo.value.contactName,
      contactPhone: shopInfo.value.contactPhone,
      businessHours: shopInfo.value.businessHours,
      status: shopInfo.value.status ?? "open",
    };
    const merchant = id
      ? await updateMerchant(id, payload)
      : await createMerchant(payload);
    merchantStore.setMerchantInfo(merchant);
    uni.showToast({ title: "保存成功", icon: "success" });
    setTimeout(() => uni.navigateBack());
  } catch (error: any) {
    uni.showToast({ title: error.message || "保存失败", icon: "none" });
  }
};

onMounted(() => {
  loadShopInfo();
});
</script>

<style scoped lang="scss">
.merchant-shop {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.shop-banner {
  position: relative;
  height: 400rpx;
  background: #e0e0e0;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.edit-banner-btn {
  position: absolute;
  right: 30rpx;
  bottom: 30rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  border: none;
  font-size: 24rpx;
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

.save-section {
  padding: 40rpx 30rpx;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 32rpx;
  border: none;
}
</style>
