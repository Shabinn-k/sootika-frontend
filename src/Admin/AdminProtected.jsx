import { Navigate } from "react-router-dom";

const AdminProtected = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const user = JSON.parse(localStorage.getItem("user"));
 
  if (!admin || user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtected;
