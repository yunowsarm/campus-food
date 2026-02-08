<template>
  <view class="message-container">
    <!-- 分类标签 -->
    <view class="type-tabs">
      <view
        v-for="tab in typeTabs"
        :key="tab.value"
        class="type-tab"
        :class="{ active: selectedType === tab.value }"
        @click="handleTypeClick(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 工具栏：全部已读 -->
    <view class="toolbar" v-if="messageList.length > 0">
      <text class="read-all-btn" @click="handleReadAll">全部已读</text>
    </view>

    <!-- 消息列表 -->
    <view class="message-list" v-if="messageList.length > 0">
      <view
        v-for="message in messageList"
        :key="message.id"
        class="message-item"
        :class="{ unread: !message.isRead }"
        @click="handleMessageClick(message)"
      >
        <view class="message-icon" :class="`type-${message.type}`">
          <text class="icon-text">{{ getTypeIcon(message.type) }}</text>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="message-title">{{ message.title }}</text>
            <text class="message-time">{{
              formatTime(message.createdAt, "MM-DD HH:mm")
            }}</text>
          </view>
          <text class="message-text">{{ message.content }}</text>
        </view>
        <view class="message-badge" v-if="!message.isRead"></view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && messageList.length > 0">
      <text class="load-more-text" v-if="loading">加载中...</text>
      <text class="load-more-text" v-else>上拉加载更多</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && messageList.length === 0">
      <text class="empty-text">暂无消息</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
import { useMessageStore } from "@/stores/message";
import { formatTime } from "@/utils/format";
import type { Message } from "@/types/message";

const messageStore = useMessageStore();

const typeTabs = [
  { label: "全部", value: "" },
  { label: "订单", value: "order" },
  { label: "拼单", value: "group" },
  { label: "系统", value: "system" },
];

const selectedType = ref<string>("");
const messageList = ref<Message[]>([]);
const currentPage = ref(1);
const pageSize = 10;
const hasMore = ref(true);
const loading = ref(false);

// 获取消息类型图标
const getTypeIcon = (type: string) => {
  const map: Record<string, string> = {
    order: "📦",
    group: "👥",
    delivery: "🚚",
    system: "🔔",
  };
  return map[type] || "🔔";
};

// 获取消息列表
const fetchMessageList = async (page: number = 1) => {
  if (loading.value) return;
  loading.value = true;
  try {
    const params: { page: number; pageSize: number; type?: string } = {
      page,
      pageSize,
    };
    if (selectedType.value) params.type = selectedType.value as any;

    const res = await messageStore.getMessageList(params);
    const list = res.list;

    if (page === 1) {
      messageList.value = list;
    } else {
      messageList.value.push(...list);
    }
    messageStore.setMessageList(messageList.value);
    hasMore.value = list.length >= pageSize;
    currentPage.value = page;
  } catch (e) {
    console.error("获取消息列表失败:", e);
  } finally {
    loading.value = false;
  }
};

// 切换分类
const handleTypeClick = (value: string) => {
  selectedType.value = value;
  currentPage.value = 1;
  fetchMessageList(1);
};

// 全部已读
const handleReadAll = async () => {
  try {
    await messageStore.markAllAsRead();
    messageList.value = messageList.value.map((m) => ({ ...m, isRead: true }));
    uni.showToast({ title: "已全部标为已读", icon: "success" });
  } catch (e) {
    uni.showToast({ title: "操作失败", icon: "none" });
  }
};

// 消息点击：标记已读并跳转
const handleMessageClick = async (message: Message) => {
  if (!message.isRead) {
    try {
      await messageStore.markAsRead(message.id);
      message.isRead = true;
    } catch (e) {
      console.error("标记已读失败:", e);
    }
  }

  if (message.type === "order" || message.type === "delivery") {
    const id = message.relatedId || message.id;
    if (id) {
      uni.navigateTo({
        url: `/pages/student/order/track?id=${id}`,
      });
    }
  } else if (message.type === "group") {
    const id = message.relatedId || message.id;
    if (id) {
      uni.navigateTo({
        url: `/pages/student/group/detail?id=${id}`,
      });
    }
  } else {
    uni.navigateTo({
      url: `/pages/student/message/detail?id=${message.id}`,
    });
  }
};

onMounted(() => {
  fetchMessageList(1);
  messageStore.updateUnreadCount();
});

onPullDownRefresh(async () => {
  currentPage.value = 1;
  await fetchMessageList(1);
  messageStore.updateUnreadCount();
  uni.stopPullDownRefresh();
});

onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    fetchMessageList(currentPage.value + 1);
  }
});
</script>

<style scoped lang="scss">
.message-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.type-tabs {
  display: flex;
  background: #ffffff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.type-tab {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666666;

  &.active {
    color: #667eea;
    font-weight: bold;
  }
}

.toolbar {
  padding: 20rpx 30rpx;
  background: #ffffff;
  margin-bottom: 2rpx;
}

.read-all-btn {
  font-size: 26rpx;
  color: #667eea;
}

.message-list {
  display: flex;
  flex-direction: column;
}

.message-item {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 2rpx;
  display: flex;
  align-items: flex-start;
  position: relative;

  &.unread {
    background: #fafbff;
  }
}

.message-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;

  &.type-order {
    background: #e8f4ff;
  }
  &.type-group {
    background: #fff3e8;
  }
  &.type-delivery {
    background: #e8f8f0;
  }
  &.type-system {
    background: #f5f0ff;
  }
}

.icon-text {
  line-height: 1;
}

.message-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.message-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 24rpx;
  color: #999999;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.message-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.message-badge {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 16rpx;
  height: 16rpx;
  background: #ff6b6b;
  border-radius: 8rpx;
}

.load-more {
  text-align: center;
  padding: 24rpx 0;
}

.load-more-text {
  font-size: 26rpx;
  color: #999999;
}

.empty-state {
  text-align: center;
  padding: 200rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
