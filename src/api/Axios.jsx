// api/Axios.js
import axios from "axios";

// Get API URL from environment or default. 
// Uses empty string to rely on Vite proxy during local development
const API_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Exclude endpoints that don't need authentication
    const publicEndpoints = ["/auth/login", "/auth/signup"];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    const token = localStorage.getItem("token");
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle different response structures from your backend
    return response;
  },
  (error) => {
    if (error.response) {
      // Backend returned error
      console.error("API Error:", error.response.data);
      
      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("admin");
        window.dispatchEvent(new Event("unauthorized"));
      }
    } else if (error.request) {
      // Request made but no response
      console.error("No response from server:", error.request);
      // Show user-friendly message
      error.message = "Cannot connect to server. Please check if backend is running.";
    }
    
    return Promise.reject(error);
  }
);

export default api;