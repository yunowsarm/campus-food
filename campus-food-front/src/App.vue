<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useUserStore } from "./stores/user";
import { useMessageStore } from "./stores/message";

const userStore = useUserStore();
const messageStore = useMessageStore();

onLaunch(() => {
  console.log("App Launch");

  // 检查用户登录状态和角色
  checkUserAuth();
});

onShow(() => {
  console.log("App Show");
  if (userStore.isLogin) {
    messageStore.updateUnreadCount();
    messageStore.startPolling();
  }
});

onHide(() => {
  console.log("App Hide");
  messageStore.stopPolling();
});

// 检查用户授权状态
function checkUserAuth() {
  const pages = getCurrentPages();
  // 如果当前在授权相关页面，不进行跳转
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    if (currentPage.route?.includes("auth")) {
      return;
    }
  }

  // 检查是否有角色信息
  if (!userStore.role) {
    // 没有角色，跳转到登录页或角色选择页
    if (!userStore.isLogin) {
      uni.reLaunch({
        url: "/pages/auth/login",
      });
    } else {
      uni.reLaunch({
        url: "/pages/auth/role-select",
      });
    }
  } else {
    // 有角色，跳转到对应首页
    const homePath =
      userStore.role === "student"
        ? "/pages/student/home/index"
        : userStore.role === "delivery"
          ? "/pages/delivery/home/index"
          : "/pages/merchant/home/index";
    // 只在首次启动时跳转，避免覆盖用户当前页面
    if (pages.length === 0) {
      uni.reLaunch({
        url: homePath,
      });
    }
  }
}
</script>
<style>
/* 全局隐藏垂直滚动条 */
page {
  /* 隐藏滚动条但保持滚动功能 */
  overflow-y: auto;
}

/* Webkit浏览器（Chrome, Safari等） */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* Firefox / IE 10+：只对根级滚动容器隐藏滚动条 */
html,
body,
page {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 确保页面可以滚动但滚动条不可见 */
page::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
