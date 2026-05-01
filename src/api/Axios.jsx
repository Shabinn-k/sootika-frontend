import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

export const initAuth = () => {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  return Promise.resolve(token);
};

api.interceptors.request.use(async (config) => {
  await initAuth();
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && 
        !originalRequest.url?.includes("/auth/refresh") && 
        !originalRequest.url?.includes("/auth/login")) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.clear();
        window.dispatchEvent(new CustomEvent("unauthorized"));
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await api.post("/auth/refresh", { refresh_token: refreshToken });
        const { new_access_token, new_refresh_token } = response.data;
        
        localStorage.setItem("token", new_access_token);
        if (new_refresh_token) localStorage.setItem("refresh_token", new_refresh_token);
        
        failedQueue.forEach(prom => prom.resolve(new_access_token));
        originalRequest.headers.Authorization = `Bearer ${new_access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach(prom => prom.reject(refreshError));
        localStorage.clear();
        window.dispatchEvent(new CustomEvent("unauthorized"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        failedQueue = [];
      }
    }
    return Promise.reject(error);
  }
);