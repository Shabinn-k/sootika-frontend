import { Navigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";

const AdminProtected = ({ children }) => {
  const { admin } = useAuth();
  
  // Simple check - admin is restored immediately from localStorage
  if (!admin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminProtected;