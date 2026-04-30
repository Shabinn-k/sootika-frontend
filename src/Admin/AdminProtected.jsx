import { Navigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";

const AdminProtected = ({ children }) => {
  const { admin, loading } = useAuth();
  
  // Show loading while checking
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "#f7efe5"
      }}>
        <div className="spinner-lg"></div>
      </div>
    );
  }
  
  // ✅ FIXED: Only check for admin
  if (!admin) {
    console.log("Admin access denied: No admin found");
    return <Navigate to="/" replace />;
  }
  
  // Double check with localStorage
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (!token || role !== "admin") {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminProtected;