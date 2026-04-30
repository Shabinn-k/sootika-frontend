// src/api/Axios.js
import axios from "axios";

// Use proxy in dev, direct URL in production
const API_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_URL || "http://localhost:8080";

console.log("Environment:", import.meta.env.DEV ? "Development" : "Production");
console.log("API_URL:", API_URL || "Using Vite proxy");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔁 Refresh handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 🚀 REQUEST INTERCEPTOR (FIXED)
api.interceptors.request.use(
  (config) => {
    const fullUrl = (config.baseURL || "") + config.url;
    console.log(`📤 ${config.method?.toUpperCase()} ${fullUrl}`);

    const token = localStorage.getItem("token");

    console.log("➡️ URL:", config.url);
    console.log("➡️ TOKEN:", token);

    // ✅ ALWAYS attach token if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ AUTH HEADER ATTACHED");
    } else {
      console.log("❌ NO TOKEN FOUND");
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// 🔁 RESPONSE INTERCEPTOR (AUTO REFRESH)
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.config.url} -> ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.clear();
        window.dispatchEvent(new Event("unauthorized"));
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        console.log("🔄 Refreshing token...");
        const response = await api.post("/auth/refresh", {
          refresh_token: refreshToken,
        });

        const { new_access_token, new_refresh_token } = response.data;

        localStorage.setItem("token", new_access_token);
        if (new_refresh_token) {
          localStorage.setItem("refresh_token", new_refresh_token);
        }

        console.log("✅ Token refreshed");

        processQueue(null, new_access_token);

        originalRequest.headers.Authorization = `Bearer ${new_access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh failed:", refreshError);

        processQueue(refreshError, null);

        localStorage.clear();
        window.dispatchEvent(new Event("unauthorized"));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Other errors
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.code === "ERR_NETWORK") {
      error.message =
        "Cannot connect to server. Check if backend is running on port 8080";
    }

    return Promise.reject(error);
  }
);

export default api;