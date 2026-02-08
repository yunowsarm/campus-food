<template>
  <div class="dashboard">
    <h2>数据看板</h2>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-label">用户总数</div>
          <div class="stat-value">{{ stats.userCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-label">商家总数</div>
          <div class="stat-value">{{ stats.merchantCount }}</div>
          <div class="stat-extra" v-if="stats.pendingMerchantCount">
            待审核: {{ stats.pendingMerchantCount }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-label">订单总数</div>
          <div class="stat-value">{{ stats.orderCount }}</div>
          <div class="stat-extra">
            交易额: ¥{{ (stats.orderAmount / 100).toFixed(2) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-label">评价总数</div>
          <div class="stat-value">{{ stats.reviewCount }}</div>
          <div class="stat-extra" v-if="stats.pendingReviewCount">
            待审核: {{ stats.pendingReviewCount }}
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getStats } from "@/api/admin";
import type { StatsRes } from "@/api/admin";

const stats = ref<StatsRes>({
  userCount: 0,
  merchantCount: 0,
  pendingMerchantCount: 0,
  orderCount: 0,
  orderAmount: 0,
  reviewCount: 0,
  pendingReviewCount: 0,
});

onMounted(async () => {
  try {
    stats.value = await getStats();
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
.dashboard h2 {
  margin-bottom: 20px;
}
.stats-row {
  margin-bottom: 20px;
}
.stat-label {
  font-size: 14px;
  color: #999;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin: 8px 0;
}
.stat-extra {
  font-size: 12px;
  color: #666;
}
</style>
