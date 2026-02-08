<template>
  <div class="foods-page">
    <h2>美食审核</h2>
    <el-card>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="name" label="菜品名称" width="160" />
        <el-table-column label="商家" width="120">
          <template #default="{ row }">{{
            row.merchantId?.name || "-"
          }}</template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }"
            >¥{{ (row.price / 100).toFixed(2) }}</template
          >
        </el-table-column>
        <el-table-column prop="createdAt" label="上架时间" width="180">
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
        description="暂无待审核美食"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getPendingFoods, approveFood, rejectFood } from "@/api/admin";
import type { FoodItem } from "@/api/admin";

const list = ref<FoodItem[]>([]);
const loading = ref(false);

function formatDate(v: string) {
  if (!v) return "-";
  return new Date(v).toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    const res = await getPendingFoods();
    list.value = (res as any).list || [];
  } catch (e) {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function approve(row: FoodItem) {
  try {
    await approveFood(row._id);
    ElMessage.success("已通过");
    load();
  } catch (e: any) {
    ElMessage.error(e.message || "操作失败");
  }
}

async function reject(row: FoodItem) {
  await ElMessageBox.confirm("确定拒绝该美食上架吗？", "提示");
  try {
    await rejectFood(row._id);
    ElMessage.success("已拒绝");
    load();
  } catch (e: any) {
    ElMessage.error(e.message || "操作失败");
  }
}

onMounted(load);
</script>

<style scoped>
.foods-page h2 {
  margin-bottom: 16px;
}
</style>
