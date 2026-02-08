<template>
  <div class="reviews-page">
    <h2>评价管理</h2>
    <el-card>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column
          prop="content"
          label="评价内容"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="用户" width="100">
          <template #default="{ row }">{{
            row.userId?.nickName || "-"
          }}</template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="80" />
        <el-table-column prop="targetType" label="类型" width="80">
          <template #default="{ row }">{{
            row.targetType === "food" ? "美食" : "商家"
          }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">{{
            formatDate(row.createdAt)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="approve(row)"
              >通过</el-button
            >
            <el-button link type="danger" size="small" @click="reject(row)"
              >拒绝</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!loading && list.length === 0"
        description="暂无待审核评价"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getPendingReviews, approveReview, rejectReview } from "@/api/admin";
import type { ReviewItem } from "@/api/admin";

const list = ref<ReviewItem[]>([]);
const loading = ref(false);

function formatDate(v: string) {
  if (!v) return "-";
  return new Date(v).toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    const res = await getPendingReviews();
    list.value = (res as any).list || [];
  } catch (e) {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function approve(row: ReviewItem) {
  try {
    await approveReview(row._id);
    ElMessage.success("已通过");
    load();
  } catch (e: any) {
    ElMessage.error(e.message || "操作失败");
  }
}

async function reject(row: ReviewItem) {
  await ElMessageBox.confirm("确定拒绝/删除该评价吗？", "提示");
  try {
    await rejectReview(row._id);
    ElMessage.success("已拒绝");
    load();
  } catch (e: any) {
    ElMessage.error(e.message || "操作失败");
  }
}

onMounted(load);
</script>

<style scoped>
.reviews-page h2 {
  margin-bottom: 16px;
}
</style>
