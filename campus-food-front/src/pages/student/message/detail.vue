<template>
  <view class="detail-container">
    <view class="loading-state" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <template v-else-if="message">
      <view class="message-card">
        <view class="message-type-row">
          <text class="type-label">类型</text>
          <text class="type-value">{{ getTypeText(message.type) }}</text>
        </view>
        <view class="message-title-row">
          <text class="detail-title">{{ message.title }}</text>
        </view>
        <view class="message-time-row">
          <text class="time-text">{{ formatTime(message.createdAt) }}</text>
        </view>
        <view class="message-body">
          <text class="body-text">{{ message.content }}</text>
        </view>
      </view>

      <view class="actions" v-if="message.relatedId && (message.type === 'order' || message.type === 'delivery' || message.type === 'group')">
        <button class="action-btn" @click="goRelated">
          {{ message.type === 'group' ? '查看拼单' : '查看订单' }}
        </button>
      </view>
    </template>

    <view class="empty-state" v-else>
      <text class="empty-text">消息不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getMessageDetail } from "@/api/messages";
import { useMessageStore } from "@/stores/message";
import { formatTime } from "@/utils/format";
import type { Message } from "@/types/message";

const messageStore = useMessageStore();
const message = ref<Message | null>(null);
const messageId = ref("");
const loading = ref(true);

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    order: "订单通知",
    group: "拼单通知",
    delivery: "配送通知",
    system: "系统通知",
  };
  return map[type] || type;
};

const fetchDetail = async () => {
  loading.value = true;
  try {
    const data = await getMessageDetail(messageId.value) as any;
    message.value = {
      ...data,
      id: data.id || data._id,
      title: data.title ?? "",
      content: data.content ?? "",
      isRead: data.isRead ?? false,
    };
    if (!message.value.isRead) {
      await messageStore.markAsRead(message.value.id);
      message.value.isRead = true;
    }
  } catch (e) {
    console.error("获取消息详情失败:", e);
    message.value = null;
  } finally {
    loading.value = false;
  }
};

const goRelated = () => {
  const m = message.value;
  if (!m?.relatedId) return;
  if (m.type === "group") {
    uni.navigateTo({ url: `/pages/student/group/detail?id=${m.relatedId}` });
  } else {
    uni.navigateTo({ url: `/pages/student/order/track?id=${m.relatedId}` });
  }
};

onLoad((options: any) => {
  if (options.id) {
    messageId.value = options.id;
    fetchDetail();
  } else {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-text,
.empty-text {
  font-size: 28rpx;
  color: #999999;
}

.message-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
}

.message-type-row {
  margin-bottom: 24rpx;
}

.type-label {
  font-size: 26rpx;
  color: #999999;
  margin-right: 16rpx;
}

.type-value {
  font-size: 26rpx;
  color: #667eea;
}

.message-title-row {
  margin-bottom: 20rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1.4;
}

.message-time-row {
  margin-bottom: 30rpx;
}

.time-text {
  font-size: 26rpx;
  color: #999999;
}

.message-body {
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.body-text {
  font-size: 30rpx;
  color: #666666;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.actions {
  padding: 20rpx 0;
}

.action-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 44rpx;
  color: #ffffff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  &::after {
    border: none;
  }
}
</style>
