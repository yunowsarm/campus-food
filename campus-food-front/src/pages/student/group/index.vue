<template>
  <view class="group-container">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        class="filter-item"
        :class="{ active: selectedDeliveryType === item.value }"
        v-for="item in deliveryTypeFilters"
        :key="item.value"
        @click="handleFilterClick(item.value as DeliveryType)"
      >
        <text>{{ item.label }}</text>
      </view>
    </view>

    <!-- 拼单列表 -->
    <view class="group-list">
      <GroupCard
        v-for="group in groupList"
        :key="group.id"
        :group="group"
        @click="handleGroupClick"
      />
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <text class="load-more-text">加载中...</text>
    </view>
    <view class="no-more" v-else-if="groupList.length > 0">
      <text class="no-more-text">没有更多了</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && groupList.length === 0">
      <text class="empty-text">暂无拼单</text>
    </view>

    <!-- 快速凑单按钮 -->
    <view class="quick-group-btn" @click="handleQuickGroup">
      <text class="quick-group-text">快速凑单</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onReachBottom, onPullDownRefresh } from "@dcloudio/uni-app";
import GroupCard from "@/components/GroupCard/GroupCard.vue";
import { getGroupList } from "@/api/group";
import { Group, DeliveryType } from "@/types/group";
import { DELIVERY_TYPE_TEXT } from "@/utils/constants";

const deliveryTypeFilters = [
  { label: "全部", value: "" },
  { label: DELIVERY_TYPE_TEXT.alone, value: "alone" },
  { label: DELIVERY_TYPE_TEXT.together, value: "together" },
  { label: DELIVERY_TYPE_TEXT.pickup, value: "pickup" },
];

const selectedDeliveryType = ref<DeliveryType | "">("");
const groupList = ref<Group[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
const loading = ref(false);

// 获取拼单列表
const fetchGroupList = async (page: number = 1) => {
  if (loading.value) return;

  loading.value = true;
  try {
    const response = await getGroupList({
      page,
      pageSize: pageSize.value,
      deliveryType: selectedDeliveryType.value || undefined,
    });

    const normalize = (g) => ({
      ...g,
      id: g.id || g._id,
      remainingTime: calculateRemainingTime(g.endTime),
    });
    if (page === 1) {
      groupList.value = response.list.map(normalize);
    } else {
      groupList.value.push(...response.list.map(normalize));
    }

    hasMore.value = response.list.length >= pageSize.value;
    currentPage.value = page;
  } catch (error) {
    console.error("获取拼单列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 计算剩余时间
const calculateRemainingTime = (endTime: string): number => {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const diff = Math.floor((end - now) / 1000);
  return Math.max(0, diff);
};

// 筛选点击
const handleFilterClick = (type: DeliveryType | "") => {
  selectedDeliveryType.value = type;
  currentPage.value = 1;
  fetchGroupList(1);
};

// 拼单点击
const handleGroupClick = (group: Group) => {
  uni.navigateTo({
    url: `/pages/student/group/detail?id=${group.id}`,
  });
};

// 快速凑单
const handleQuickGroup = () => {
  uni.navigateTo({
    url: "/pages/student/category/index?from=quickGroup",
  });
};

// 下拉刷新
onPullDownRefresh(async () => {
  currentPage.value = 1;
  await fetchGroupList(1);
  uni.stopPullDownRefresh();
});

// 上拉加载更多
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    fetchGroupList(currentPage.value + 1);
  }
});

onMounted(() => {
  fetchGroupList(1);

  // 定时更新剩余时间
  setInterval(() => {
    groupList.value = groupList.value.map((group) => ({
      ...group,
      remainingTime: calculateRemainingTime(group.endTime),
    }));
  }, 1000);
});
</script>

<style scoped lang="scss">
.group-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.filter-bar {
  background: #ffffff;
  padding: 20rpx 30rpx;
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.filter-item {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  font-size: 26rpx;
  color: #666666;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
}

.group-list {
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

.quick-group-btn {
  position: fixed;
  bottom: 40rpx;
  right: 30rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);
}

.quick-group-text {
  font-size: 24rpx;
  color: #ffffff;
  text-align: center;
}
</style>
