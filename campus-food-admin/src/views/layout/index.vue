<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">后台管理</div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">数据看板</el-menu-item>
        <el-menu-item index="/users">用户管理</el-menu-item>
        <el-menu-item index="/merchants">商家审核</el-menu-item>
        <el-menu-item index="/foods">美食审核</el-menu-item>
        <el-menu-item index="/reviews">评价管理</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="title">校园美食平台</span>
        <el-button type="danger" link @click="handleLogout">退出</el-button>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAdminUserStore } from "@/stores/user";

const router = useRouter();
const store = useAdminUserStore();

const handleLogout = () => {
  store.logout();
  router.push("/login");
};
</script>

<style scoped>
.layout {
  height: 100vh;
}
.aside {
  background: #304156;
}
.logo {
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #fff;
  font-weight: bold;
}
.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-size: 18px;
}
.main {
  background: #f0f2f5;
  padding: 20px;
}
</style>
