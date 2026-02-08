import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/login/index.vue"),
      meta: { public: true },
    },
    {
      path: "/",
      component: () => import("@/views/layout/index.vue"),
      redirect: "/dashboard",
      children: [
        {
          path: "dashboard",
          name: "Dashboard",
          component: () => import("@/views/dashboard/index.vue"),
        },
        {
          path: "users",
          name: "Users",
          component: () => import("@/views/users/index.vue"),
        },
        {
          path: "merchants",
          name: "Merchants",
          component: () => import("@/views/merchants/index.vue"),
        },
        {
          path: "foods",
          name: "Foods",
          component: () => import("@/views/foods/index.vue"),
        },
        {
          path: "reviews",
          name: "Reviews",
          component: () => import("@/views/reviews/index.vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("admin_token");
  if (to.meta.public || to.path === "/login") {
    if (token && to.path === "/login") return next("/");
    return next();
  }
  if (!token) return next("/login");
  next();
});

export default router;
