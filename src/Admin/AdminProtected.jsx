import { Navigate } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { useEffect, useState } from "react";

const AdminProtected = ({ children }) => {
  const { admin, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give time for auth context to restore from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking
  if (loading || isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f7efe5',
        color: '#5a4634'
      }}>
        <div className="loader">Loading Admin...</div>
      </div>
    );
  }

  // Redirect if not admin
  if (!admin) {
    return <Navigate to="/" replace />;
  }

  // Allow access to admin pages
  return children;
};

export default AdminProtected;