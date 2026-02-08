import { defineStore } from "pinia";
import { ref } from "vue";

export const useAdminUserStore = defineStore("adminUser", () => {
  const token = ref(localStorage.getItem("admin_token") || "");
  const user = ref<{ id: string; nickName: string; role: string } | null>(null);

  function setToken(t: string) {
    token.value = t;
    if (t) localStorage.setItem("admin_token", t);
    else localStorage.removeItem("admin_token");
  }

  function setUser(u: { id: string; nickName: string; role: string } | null) {
    user.value = u;
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const isAdmin = () => token.value && user.value?.role === "admin";

  return { token, user, setToken, setUser, logout, isAdmin };
});
