<template>
  <div class="users-page">
    <h2>用户管理</h2>
    <el-card>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="filter.keyword"
            placeholder="昵称/邮箱"
            clearable
            @clear="load"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="filter.role"
            placeholder="全部"
            clearable
            @change="load"
          >
            <el-option label="学生" value="student" />
            <el-option label="商家" value="merchant" />
            <el-option label="配送员" value="delivery" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="nickName" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ roleText[row.role] || row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'active' ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === "active" ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">{{
            formatDate(row.createdAt)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.role !== 'admin'"
              link
              type="primary"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === "active" ? "禁用" : "启用" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="load"
        style="margin-top: 16px"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getUsers, setUserStatus } from "@/api/admin";
import type { UserItem } from "@/api/admin";

const list = ref<UserItem[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const filter = reactive({ keyword: "", role: "" });
const roleText: Record<string, string> = {
  student: "学生",
  merchant: "商家",
  delivery: "配送员",
  admin: "管理员",
};

function formatDate(v: string) {
  if (!v) return "-";
  return new Date(v).toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    const res = await getUsers({
      page: page.value,
      pageSize: pageSize.value,
      keyword: filter.keyword || undefined,
      role: filter.role || undefined,
    });
    list.value = (res as any).list || [];
    total.value = (res as any).total || 0;
  } catch (e) {
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function toggleStatus(row: UserItem) {
  const next = row.status === "active" ? "disabled" : "active";
  await ElMessageBox.confirm(
    `确定${next === "disabled" ? "禁用" : "启用"}用户「${row.nickName}」吗？`,
    "提示"
  );
  try {
    await setUserStatus(row._id, next as "active" | "disabled");
    ElMessage.success("操作成功");
    load();
  } catch (e: any) {
    ElMessage.error(e.message || "操作失败");
  }
}

onMounted(load);
</script>

<style scoped>
.users-page h2 {
  margin-bottom: 16px;
}
.filter-form {
  margin-bottom: 16px;
}
</style>
