<template>
  <div class="merchants-page">
    <h2>商家审核</h2>
    <el-card>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="name" label="店铺名称" width="160" />
        <el-table-column
          prop="address"
          label="地址"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="contactName" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="联系电话" width="120" />
        <el-table-column prop="createdAt" label="申请时间" width="180">
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
        description="暂无待审核商家"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getPendingMerchants,
  approveMerchant,
  rejectMerchant,
} from "@/api/admin";
import type { MerchantItem } from "@/api/admin";

const list = ref<MerchantItem[]>([]);
const loading = ref(false);

function formatDate(v: string) {
  if (!v) return "-";
  return new Date(v).toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    const res = await getPendingMerchants();
    list.value = (res as any).list || [];
  } catch (e) {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function approve(row: MerchantItem) {
  try {
    await approveMerchant(row._id);
    ElMessage.success("已通过");
    load();
  } catch (e: any) {
    ElMessage.error(e.message || "操作失败");
  }
}

async function reject(row: MerchantItem) {
  await ElMessageBox.confirm("确定拒绝该商家入驻吗？", "提示");
  try {
    await rejectMerchant(row._id);
    ElMessage.success("已拒绝");
    load();
  } catch (e: any) {
    ElMessage.error(e.message || "操作失败");
  }
}

onMounted(load);
</script>

<style scoped>
.merchants-page h2 {
  margin-bottom: 16px;
}
</style>
