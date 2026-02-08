<template>
  <view class="edit-profile-container">
    <!-- 头像 -->
    <view class="form-section">
      <view class="form-item">
        <text class="label">头像</text>
        <view class="avatar-box" @click="handleChooseAvatar">
          <image
            class="avatar"
            :src="formData.avatarUrl || '/static/cover/cover.png'"
            mode="aspectFill"
          />
        </view>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="form-section">
      <view class="form-item">
        <text class="label">昵称</text>
        <input
          class="input"
          v-model="formData.nickName"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="label">性别</text>
        <view class="gender-box">
          <view
            class="gender-item"
            :class="{ active: formData.gender === 1 }"
            @click="formData.gender = 1"
          >
            <text>男</text>
          </view>
          <view
            class="gender-item"
            :class="{ active: formData.gender === 2 }"
            @click="formData.gender = 2"
          >
            <text>女</text>
          </view>
          <view
            class="gender-item"
            :class="{ active: formData.gender === 0 }"
            @click="formData.gender = 0"
          >
            <text>保密</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">手机号</text>
        <input
          class="input"
          v-model="formData.phone"
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
        />
      </view>

      <view class="form-item">
        <text class="label">学号</text>
        <input
          class="input"
          v-model="formData.studentId"
          placeholder="请输入学号"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="label">宿舍地址</text>
        <input
          class="input"
          v-model="formData.dormitory"
          placeholder="请输入宿舍地址"
          maxlength="50"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="button-section">
      <button class="save-btn" @click="handleSave" :loading="loading">
        保存
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import type { UserInfo } from "@/types/user";

const userStore = useUserStore();
const loading = ref(false);

// 表单数据
const formData = reactive({
  avatarUrl: "",
  nickName: "",
  gender: 0, // 0-保密 1-男 2-女
  phone: "",
  studentId: "",
  dormitory: "",
});

// 初始化表单数据
onMounted(() => {
  if (userStore.userInfo) {
    formData.avatarUrl = userStore.userInfo.avatarUrl || "";
    formData.nickName = userStore.userInfo.nickName || "";
    formData.gender = userStore.userInfo.gender ?? 0; // 使用 ?? 以支持 0 值
    formData.phone = userStore.userInfo.phone || "";
    formData.studentId = userStore.userInfo.studentId || "";
    formData.dormitory = userStore.userInfo.dormitory || "";
  }
});

// 选择头像
const handleChooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      // 这里应该上传到服务器，暂时使用本地路径
      formData.avatarUrl = tempFilePath;

      // TODO: 实际项目中需要上传到服务器
      // uploadImage(tempFilePath).then(url => {
      //   formData.avatarUrl = url;
      // });
    },
  });
};

// 保存资料
const handleSave = async () => {
  // 验证必填项
  if (!formData.nickName.trim()) {
    uni.showToast({
      title: "请输入昵称",
      icon: "none",
    });
    return;
  }

  if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({
      title: "请输入正确的手机号",
      icon: "none",
    });
    return;
  }

  loading.value = true;

  try {
    // await updateUserInfo(formData);

    // 更新本地store
    userStore.updateUserInfo(formData);

    uni.showToast({
      title: "保存成功",
      icon: "success",
    });

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    console.error("保存失败:", error);
    uni.showToast({
      title: "保存失败，请重试",
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.edit-profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx 0;
}

.form-section {
  background-color: #ffffff;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin: 0 24rpx 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333333;
  flex-shrink: 0;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  text-align: right;

  &::placeholder {
    color: #cccccc;
  }
}

.avatar-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 20rpx;
}

.avatar-tip {
  font-size: 24rpx;
  color: #999999;
}

.gender-box {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.gender-item {
  width: 88rpx;
  height: 60rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #666666;
  transition: all 0.3s;

  &.active {
    background-color: #667eea;
    border-color: #667eea;
    color: #ffffff;
  }
}

.button-section {
  padding: 40rpx 24rpx;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 44rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  &::after {
    border: none;
  }
}
</style>
