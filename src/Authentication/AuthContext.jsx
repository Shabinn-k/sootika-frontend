// src/Authentication/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/Axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // ✅ Restore from localStorage IMMEDIATELY
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem("admin");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // ✅ Start loading as FALSE because we already have data from localStorage
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Just validate token in background, don't block rendering
  useEffect(() => {
    const validate = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token) {
        setUser(null);
        setAdmin(null);
        return;
      }

      try {
        const res = await api.get("/user/dashboard");
        const data = res.data;

        if (role === "admin") {
          const adminData = {
            id: data.admin_id || data.user_id,
            name: data.name || "Admin",
            role: "admin",
          };
          setAdmin(adminData);
          setUser(null);
          localStorage.setItem("admin", JSON.stringify(adminData));
          localStorage.removeItem("user");
        } else {
          const userData = {
            id: data.user_id,
            name: data.name,
            role: "user",
          };
          setUser(userData);
          setAdmin(null);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.removeItem("admin");
        }
      } catch (err) {
        console.error("Auth validate failed:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          setUser(null);
          setAdmin(null);
        }
      }
    };

    validate();
  }, []);

  // Handle forced logout (from Axios 401 refresh fail)
  useEffect(() => {
    const handleUnauthorized = () => {
      toast.error("Session expired. Please login again.");
      logoutUser();
      navigate("/");
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  // 🔐 LOGIN
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { access_token, refresh_token, role } = res.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("role", role);

      if (role === "admin") {
        const adminData = { id: email, email, role: "admin" };
        setAdmin(adminData);
        setUser(null);
        localStorage.setItem("admin", JSON.stringify(adminData));
        localStorage.removeItem("user");
        toast.success("Admin Login Successful!");
        navigate("/admin/dashboard");
      } else {
        const userData = { id: email, email, role: "user" };
        setUser(userData);
        setAdmin(null);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.removeItem("admin");
        toast.success("Login Successful!");
        navigate("/");
      }

      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
      return false;
    }
  };

  // 🔓 LOGOUT
  const logoutUser = async () => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (refresh_token) {
        await api.post("/auth/logout", { refresh_token });
      }
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.clear();
      setUser(null);
      setAdmin(null);
      navigate("/");
      toast.info("Logged out");
    }
  };

  // ✅ Remove loading check - render immediately with restored state
  return (
    <AuthContext.Provider
      value={{ user, admin, loading, login, logoutUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};