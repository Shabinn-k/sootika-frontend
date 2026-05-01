import { createContext, useContext, useEffect, useState } from "react";
import { api, initAuth } from "../api/Axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await initAuth();
        let response;
        try {
          response = await api.get("/user/dashboard");
        } catch (err) {
          if (role === "admin") {
            response = await api.get("/admin/dashboard");
          } else {
            throw err;
          }
        }

        if (role === "admin") {
          const adminData = {
            id: response.data?.id || response.data?.admin_id,
            name: response.data?.name || "Admin",
            email: response.data?.email,
            role: "admin",
          };
          setAdmin(adminData);
          setUser(null);
          localStorage.setItem("admin", JSON.stringify(adminData));
        } else {
          const userData = {
            id: response.data?.id || response.data?.user_id,
            name: response.data?.name,
            email: response.data?.email,
            role: "user",
          };
          setUser(userData);
          setAdmin(null);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.clear();
        setUser(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.clear();
      setUser(null);
      setAdmin(null);
      toast.error("Session expired. Please login again.");
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password
      });

      const { access_token, refresh_token, role, name } = res.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("role", role);

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      let userData = null;
      let adminData = null;

      if (role === "admin") {
        adminData = { id: email, name: name || "Admin", email, role: "admin" };
        setAdmin(adminData);
        setUser(null);
      } else {
        userData = { id: email, name: name || "", email, role: "user" };
        setUser(userData);
        setAdmin(null);
      }

      return {
        success: true,
        role,
        user: userData,
        admin: adminData
      };

    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post("/auth/signup", {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      });

      toast.success("Signup successful! Please check your email for OTP.");
      return { success: true, email: userData.email };
    } catch (err) {
      console.error("Signup error:", err.response?.data);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Signup failed!");
      return { success: false };
    }
  };

  const logoutUser = async () => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (refresh_token) {
        await api.post("/auth/logout", { refresh_token });
      }
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.clear();
      setUser(null);
      setAdmin(null);
      delete api.defaults.headers.common["Authorization"];
      toast.info("Logged out");
      // navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        login,
        logoutUser,
        signup,
        setUser
      }}>
      {children}
    </AuthContext.Provider>
  );
};