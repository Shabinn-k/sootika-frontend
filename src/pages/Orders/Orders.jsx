import React, { useEffect, useState } from "react";
import "./Orders.css";
import { api, initAuth } from "../../api/Axios";
import { useAuth } from "../../Authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.warn("Please login to view orders");
      navigate("/");
      return;
    }

    if (user && !authLoading) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      await initAuth();
      const response = await api.get("/orders");
      setOrders(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load orders");
      }

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (cancellingId) return;

    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancellingId(orderId);

    try {
      await initAuth();
      await api.put(`/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (order) => {
    return (order.track || order.order_status || "pending").toLowerCase();
  };

  const getStatusClass = (status) => {
    const map = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      shipped: "status-shipped",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return map[status] || "status-pending";
  };

  // 🔥 AUTH LOADING
  if (authLoading) {
    return (
      <div className="orders-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Verifying...</p>
        </div>
      </div>
    );
  }

  // 🔥 PAGE LOADING
  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <button className="btnHome" onClick={() => navigate("/")}>
        ← Go Home
      </button>

      <h2 className="orders-title">My Orders</h2>

      {orders.length === 0 ? (
        <div className="orders-empty-wrapper">
          <div className="empty-icon">📦</div>
          <p className="no-orders">You have no orders yet.</p>
          <button className="shop-now-btn" onClick={() => navigate("/")}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const status = getStatus(order);

            return (
              <div className="order-card" key={order.id || order.orderId}>
                {/* HEADER */}
                <div className="order-header">
                  <div className="order-info">
                    <h3>
                      Order #
                      {order.order_number ||
                        order.orderId ||
                        order.id?.slice(0, 8)}
                    </h3>
                    <p className="order-date">
                      {formatDate(order.created_at || order.date)}
                    </p>
                  </div>

                  <span
                    className={`order-status ${getStatusClass(status)}`}
                  >
                    {status}
                  </span>
                </div>

                {/* ITEMS */}
                <div className="order-items">
                  {(order.items || []).map((item, idx) => (
                    <div
                      className="order-item"
                      key={item.id || item.product_id || idx}
                    >
                      <img
                        src={item.image || item.main_image}
                        alt={item.title}
                      />

                      <div className="order-item-info">
                        <h4>{item.title}</h4>
                        <p>Qty: {item.quantity}</p>
                        <p className="item-price">
                          ₹ {Number(item.price || 0)}
                        </p>
                      </div>

                      <p className="item-total">
                        ₹{" "}
                        {Number(item.price || 0) *
                          (item.quantity || 0)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ADDRESS */}
                {order.shipping_address && (
                  <div className="shipping-address">
                    <strong>📮 Shipping Address:</strong>
                    <p>
                      {order.shipping_address.address},{" "}
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.state} -{" "}
                      {order.shipping_address.pincode}
                    </p>
                  </div>
                )}

                {/* FOOTER */}
                <div className="order-footer">
                  <div className="payment-info">
                    <span>
                      Payment:{" "}
                      {order.payment_method?.toUpperCase() || "N/A"}
                    </span>
                    <span>
                      Status: {order.payment_status || "Pending"}
                    </span>
                  </div>

                  <div className="order-total">
                    <h3>₹ {Number(order.total || 0)}</h3>

                    {status === "pending" && (
                      <button
                        className="cancel-order-btn"
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                      >
                        {cancellingId === order.id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;