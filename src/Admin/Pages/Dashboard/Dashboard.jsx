import React, { useEffect, useState } from "react";
import Layout from "../../Components/Layout";
import { adminService } from "../../../api/admin";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_products: 0,
    total_users: 0,
    pending_feedback: 0,
    total_revenue: 0,
    recent_users: []
  });

  const fetchDashboardData = async () => {
    try {
      const res = await adminService.getDashboard();
      if (res.data && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const goTo = (path) => navigate(path);

  return (
    <Layout>
      <div className="dashboard-container">

        <h1 className="dash-title">Dashboard Overview</h1>
        <div className="dash-cards">
          <div className="dash-card" onClick={() => goTo("/admin/products")}>
            <h2>{stats.total_products || 0}</h2>
            <p>Total Products</p>
          </div>

          <div className="dash-card" onClick={() => goTo("/admin/users")}>
            <h2>{stats.total_users || 0}</h2>
            <p>Total Users</p>
          </div>

          <div className="dash-card" onClick={() => goTo("/admin/orders")}>
            <h2>0</h2>
            <p>Total Orders</p>
          </div>

          <div className="dash-card">
            <h2>₹ {(stats.total_revenue || 0).toLocaleString()}</h2>
            <p>Total Revenue</p>
          </div>

          <div className="dash-card warning" onClick={() => goTo("/admin/orders")}>
            <h2>0</h2>
            <p>Pending Orders</p>
          </div>

          <div className="dash-card warning" onClick={() => goTo("/admin/feedback")}>
            <h2>{stats.pending_feedback || 0}</h2>
            <p>Pending Feedback</p>
          </div>

        </div>

        <h2 className="recent-title">Recent Users</h2>
        <div className="recent-orders" onClick={() => goTo("/admin/users")}>
          {(stats.recent_users || []).map((user, index) => (
            <div className="recent-item" key={index}>
              <p><b>Name:</b> {user.name}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Role:</b> {user.role}</p>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;
