import { api } from "./Axios";

export const authService = {
  // Test endpoint
  test: () => api.get("/api/test"),

  // Signup
  signup: (userData) => api.post("/auth/signup", userData),

  // Check OTP
  checkOtp: (data) => api.post("/auth/check", data),
  
  // Verify OTP
  verifyOTP: (data) => api.post("/auth/check", data),

  // Resend OTP
  resendOTP: (email) => api.post("/auth/resend-otp", { email }),

  // Login
  login: (credentials) => api.post("/auth/login", credentials),

  // Refresh Token
  refreshToken: (data) => api.post("/auth/refresh", data),

  // Logout
  logout: () => api.post("/auth/logout"),

  // Get user dashboard (Protected)
  getUserDashboard: () => api.get("/user/dashboard"),
};
