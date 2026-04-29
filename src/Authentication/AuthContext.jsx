// Authentication/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/Axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("admin");
    const token = localStorage.getItem("token");

    if (token) {
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      toast.error("Session expired. Please log in again.");
      logoutUser();
      navigate("/");
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Backend response: { access_token, refresh_token, role }
      const { access_token, refresh_token, role } = res.data;
      
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      
      // Get user details
      const userRes = await api.get("/user/dashboard", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      const userData = {
        id: userRes.data.user_id,
        name: userRes.data.name,
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
      console.error("Login error:", err);
      toast.error(err.response?.data?.error || "Login failed!");
      return false;
    }
  };

  const signup = async (userData) => {
    try {
      const res = await api.post("/auth/signup", {
        name: userData.name,
        email: userData.email,
        phone: userData.number,
        password: userData.password
      });
      
      toast.success("Signup successful! Please check your email for OTP.");
      navigate("/");
      return true;
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err.response?.data?.error || "Signup failed!");
      return false;
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
      navigate("/");
    }
  };

  const logoutAdmin = logoutUser;

  if (loading) return <div>Loading...</div>;

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