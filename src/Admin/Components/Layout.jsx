import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Layout.css";
import { useAuth } from "../../Authentication/AuthContext";
import { FiLogOut } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";

const Layout = ({ children, isLoading = false }) => {
  const { logoutUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logoutUser();
      navigate("/", { replace: true });
    }
  };

  // Show global loading state
  if (authLoading || isLoading) {
    return (
      <div className="admin-wrapper">
        <div style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f7efe5"
        }}>
          <LoadingSpinner message="Loading admin panel..." size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Admin Panel</h2>

        <nav>
          <ul className="admin-menu">
            <li>
              <NavLink 
                className={({ isActive }) => `link-items1 ${isActive ? "active" : ""}`}
                to="/admin/dashboard"
                end
              >
                Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink 
                className={({ isActive }) => `link-items1 ${isActive ? "active" : ""}`}
                to="/admin/products"
              >
                Products
              </NavLink>
            </li>

            <li>
              <NavLink 
                className={({ isActive }) => `link-items1 ${isActive ? "active" : ""}`}
                to="/admin/users"
              >
                Users
              </NavLink>
            </li>

            <li>
              <NavLink 
                className={({ isActive }) => `link-items1 ${isActive ? "active" : ""}`}
                to="/admin/orders"
              >
                Orders
              </NavLink>
            </li>

            <li>
              <NavLink 
                className={({ isActive }) => `link-items1 ${isActive ? "active" : ""}`}
                to="/admin/feedback"
              >
                Feedback
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="logout-wrapper">
          <button className="logout" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <div className="admin-page">{children}</div>
      </main>
    </div>
  );
};

export default Layout;