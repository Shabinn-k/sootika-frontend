import { api, initAuth } from "./Axios";

export const authService = {
  signup: async (userData) => {
    try {
      const response = await api.post("/auth/signup", userData);
      if (response.data?.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("role", response.data.role || "user");
        if (response.data.refresh_token) localStorage.setItem("refresh_token", response.data.refresh_token);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Signup failed" };
    }
  },

verifyOTP: async (data) => {
  try {
    const response = await api.post("/auth/verify", data) 
    if (response.status === 200 && response.data) {
      return { success: true, data: response.data };
    }
    return { success: false, error: "Verification failed" };
  } catch (error) {
    console.error("OTP verification error:", error); 
    return { 
      success: false, 
      error: error.response?.data?.error || "OTP verification failed" 
    };
  }
},

  resendOTP: async (email) => {
    try {
      const response = await api.post("/auth/resend-otp", { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Failed to resend OTP" };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { access_token, refresh_token, role, name, email } = response.data;
      
      if (access_token) {
        localStorage.setItem("token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("role", role);
      }
      
      return { success: true, data: { access_token, refresh_token, role, name, email } };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Login failed" };
    }
  },

  logout: async () => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (refresh_token) await api.post("/auth/logout", { refresh_token });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      delete api.defaults.headers.common["Authorization"];
    }
    return { success: true };
  },

  getUserDashboard: async () => {
    try {
      await initAuth();
      const response = await api.get("/user/dashboard");
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || "Failed to load dashboard",
        unauthorized: error.response?.status === 401
      };
    }
  }
};