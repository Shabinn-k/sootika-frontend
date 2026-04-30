import React, { useEffect, useState } from "react";
import Layout from "../../Components/Layout";
import { adminService } from "../../../api/admin";
import { api, initAuth } from "../../../api/Axios";
import { useAuth } from "../../../Authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../../Components/LoadingSpinner";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    total_products: 0,
    total_users: 0,
    pending_feedback: 0,
    total_revenue: 0,
    recent_users: [],
    total_orders: 0,
    pending_orders: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !admin) {
      toast.error("Access denied. Admin only.");
      navigate("/");
    }
  }, [admin, authLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await initAuth();
      
      const res = await adminService.getDashboard();
      const ordersRes = await api.get("/admin/orders");
      const orders = ordersRes.data?.data || [];
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => 
        (order.track?.toLowerCase() === "pending" || 
         order.order_status?.toLowerCase() === "pending")
      ).length;
      
      const totalRevenue = orders
        .filter(order => order.track?.toLowerCase() === "delivered")
        .reduce((sum, order) => sum + (order.total || order.amount || 0), 0);
      
      if (res.data && res.data.stats) {
        setStats({
          ...res.data.stats,
          total_orders: totalOrders,
          pending_orders: pendingOrders,
          total_revenue: totalRevenue
        });
      } else {
        setStats(prev => ({
          ...prev,
          total_orders: totalOrders,
          pending_orders: pendingOrders,
          total_revenue: totalRevenue
        }));
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && admin) {
      fetchDashboardData();
    }
  }, [authLoading, admin]);

  const goTo = (path) => navigate(path);

  if (authLoading || loading) {
    return (
      <Layout isLoading={authLoading || loading}>
        <LoadingSpinner message={authLoading ? "Verifying access..." : "Loading dashboard data..."} />
      </Layout>
    );
  }

  if (!admin) return null;

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
            <h2>{stats.total_orders || 0}</h2>
            <p>Total Orders</p>
          </div>

          <div className="dash-card">
            <h2>₹ {(stats.total_revenue || 0).toLocaleString()}</h2>
            <p>Total Revenue</p>
          </div>

          <div className="dash-card warning" onClick={() => goTo("/admin/orders")}>
            <h2>{stats.pending_orders || 0}</h2>
            <p>Pending Orders</p>
          </div>

          <div className="dash-card warning" onClick={() => goTo("/admin/feedback")}>
            <h2>{stats.pending_feedback || 0}</h2>
            <p>Pending Feedback</p>
          </div>
        </div>

        <h2 className="recent-title">Recent Users</h2>
        <div className="recent-orders" onClick={() => goTo("/admin/users")}>
          {stats.recent_users && stats.recent_users.length > 0 ? (
            stats.recent_users.map((user, index) => (
              <div className="recent-item" key={user.id || user.ID || index}>
                <p><b>Name:</b> {user.name}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Role:</b> {user.role}</p>
              </div>
            ))
          ) : (
            <div className="recent-item">
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;