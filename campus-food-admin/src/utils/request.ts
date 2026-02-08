import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "";

const request = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  (res) => {
    const data = res.data;
    if (data.code !== 0 && data.code !== 200) {
      return Promise.reject(new Error(data.message || "请求失败"));
    }
    return data.data;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/#/login";
    }
    return Promise.reject(
      err.response?.data?.message || err.message || "网络错误"
    );
  }
);

export default request;
