import { Navigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";

const AdminProtected = ({ children }) => {
  const { admin, loading } = useAuth();
  
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
  
  if (!admin) {
    console.log("Admin access denied: No admin found");
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminProtected;