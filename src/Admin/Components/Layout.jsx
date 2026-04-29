import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Layout.css";
import { useAuth } from "../../Authentication/AuthContext";
import { FiLogOut } from "react-icons/fi";

const Layout = ({ children }) => {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-wrapper">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Admin</h2>

        <nav>
          <ul className="admin-menu">
            <li>
              <NavLink className="link-items1" to="/admin/dashboard">
                Dashboard
              </NavLink>
            </li>

            <li>
              <NavLink className="link-items1" to="/admin/products">
                Products
              </NavLink>
            </li>

            <li>
              <NavLink className="link-items1" to="/admin/users">
                Users
              </NavLink>
            </li>

            <li>
              <NavLink className="link-items1" to="/admin/orders">
                Orders
              </NavLink>
            </li>

            <li>
              <NavLink className="link-items1" to="/admin/feedback">
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

      {/* MAIN CONTENT */}
      <main className="admin-content">
        <div className="admin-page">{children}</div>
      </main>

    </div>
  );
};

export default Layout;
