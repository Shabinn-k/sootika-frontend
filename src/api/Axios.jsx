// src/api/Axios.js
import axios from "axios";

// In development, use empty string to go through Vite proxy
// In production, use the environment variable
const API_URL = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "http://localhost:8080");

console.log("Environment:", import.meta.env.DEV ? "Development" : "Production");
console.log("API_URL:", API_URL || "Using Vite proxy");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL + config.url;
    console.log(`📤 ${config.method?.toUpperCase()} ${fullUrl}`);
    
    const publicEndpoints = ["/auth/login", "/auth/signup", "/auth/check"];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    const token = localStorage.getItem("token");
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.config.url} -> ${response.status}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
      localStorage.removeItem("refresh_token");
      window.dispatchEvent(new Event("unauthorized"));
    } else if (error.code === "ERR_NETWORK") {
      error.message = "Cannot connect to server. Please check if backend is running on port 8080";
    }
    
    return Promise.reject(error);
  }
);

export default api;