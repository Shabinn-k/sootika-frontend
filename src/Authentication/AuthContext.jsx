// Authentication/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/Axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("user");
      }
    }
    return null;
  });
  
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem("token");
    const storedAdmin = localStorage.getItem("admin");
    if (token && storedAdmin) {
      try {
        return JSON.parse(storedAdmin);
      } catch (e) {
        console.error("Failed to parse stored admin", e);
        localStorage.removeItem("admin");
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState(true); // Start as true
  const navigate = useNavigate();

  // Validate token on app load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to get user info with current token
        const response = await api.get("/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = response.data;
        const role = userData.role || localStorage.getItem("role");
        
        if (role === "admin") {
          const adminData = {
            id: userData.admin_id || userData.user_id,
            name: userData.name || "Admin",
            role: "admin"
          };
          setAdmin(adminData);
          localStorage.setItem("admin", JSON.stringify(adminData));
        } else {
          const userInfo = {
            id: userData.user_id,
            name: userData.name,
            role: "user"
          };
          setUser(userInfo);
          localStorage.setItem("user", JSON.stringify(userInfo));
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        // Token invalid, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("admin");
        localStorage.removeItem("refresh_token");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      toast.error("Session expired. Please log in again.");
      logoutUser();
      navigate("/");
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      
      const res = await api.post("/auth/login", { email, password });
      console.log("Login response:", res.data);
      
      const { access_token, refresh_token, role } = res.data;
      
      if (!access_token) {
        throw new Error("No access token received");
      }
      
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("role", role);
      
      // Create basic user data from login response
      const userData = {
        id: email, // Temporary, will be updated from dashboard
        email: email,
        role: role
      };
      
      if (role === "admin") {
        setAdmin(userData);
        localStorage.setItem("admin", JSON.stringify(userData));
        localStorage.removeItem("user");
        toast.success("Admin Login Successful!");
        navigate("/admin/dashboard");
      } else {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.removeItem("admin");
        toast.success("Login Successful!");
        navigate("/");
      }
      return true;
      
    } catch (err) {
      console.error("Login error details:", err.response?.data || err.message);
      
      let errorMessage = "Login failed. Please try again.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (err.code === "ERR_NETWORK") {
        errorMessage = "Cannot connect to server. Please check if backend is running.";
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const signup = async (userData) => {
    try {
      await api.post("/auth/signup", {
        name: userData.name,
        email: userData.email,
        phone: userData.number,
        password: userData.password
      });
      
      toast.success("Signup successful! Please check your email for OTP.");
      return { success: true, email: userData.email };
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      
      let errorMessage = "Signup failed!";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 409) {
        errorMessage = "Email already exists. Please use a different email.";
      }
      
      toast.error(errorMessage);
      return { success: false };
    }
  };

  const logoutUser = async () => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (refresh_token) {
        await api.post("/auth/logout", { refresh_token });
      }
    } catch(err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      setAdmin(null);
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("role");
      navigate("/");
      toast.info("Logged out successfully");
    }
  };

  const logoutAdmin = logoutUser;

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f7efe5',
        color: '#5a4634'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        login,
        logoutUser,
        logoutAdmin,
        signup,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};