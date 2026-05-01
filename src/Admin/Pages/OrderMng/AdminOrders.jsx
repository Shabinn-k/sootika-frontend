import React, { useEffect, useState } from "react";
import Layout from "../../Components/Layout";
import { api, initAuth } from "../../../api/Axios";
import { useAuth } from "../../../Authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../../Components/LoadingSpinner";
import "./AdminOrders.css";

const AdminOrders = () => {
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      await initAuth();

      const response = await api.get("/admin/orders");
      const ordersList = response.data?.data || [];

      const formattedOrders = ordersList.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        userName: order.user?.name || "Unknown",
        userEmail: order.user?.email || "N/A",
        userPhone: order.user?.phone || "N/A",
        date: order.created_at,
        track: (order.track || order.order_status || "pending").toLowerCase(),
        items: order.items || [],
        total: Number(order.total || 0),
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        shippingAddress: order.shipping_address,
      }));

      setOrders(formattedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);

      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && admin) {
      fetchOrders();
    }
  }, [authLoading, admin]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (updatingId) return;

    try {
      setUpdatingId(orderId);
      await initAuth();

      await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, track: newStatus.toLowerCase() }
            : order
        )
      );

      toast.success(`Order ${newStatus} updated`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "#2e7d32";
      case "shipped":
        return "#1976d2";
      case "cancelled":
        return "#d32f2f";
      default:
        return "#ed6c02";
    }
  };

  if (authLoading || loading) {
    return (
      <Layout isLoading={true}>
        <LoadingSpinner
          message={
            authLoading ? "Verifying..." : "Loading orders..."
          }
        />
      </Layout>
    );
  }

  if (!admin) return null;

  return (
    <Layout>
      <div className="admin-orders">
        <h2>All Orders ({orders.length})</h2>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found</p>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.id}>
              {/* HEADER */}
              <div className="order-header">
                <div>
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="order-date">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className="order-status-badge"
                  style={{
                    background: getStatusColor(order.track),
                    color: "#fff",
                  }}
                >
                  {order.track}
                </span>
              </div>

              {/* USER INFO */}
              <div className="order-user-info">
                <p><strong>Customer:</strong> {order.userName}</p>
                <p><strong>Email:</strong> {order.userEmail}</p>
                <p><strong>Phone:</strong> {order.userPhone}</p>
              </div>

              {/* PAYMENT */}
              <div className="order-payment-info">
                <p>
                  <strong>Payment:</strong>{" "}
                  {order.paymentMethod?.toUpperCase() || "COD"}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span className={`payment-status ${order.paymentStatus}`}>
                    {order.paymentStatus || "pending"}
                  </span>
                </p>
              </div>

              {/* TOTAL */}
              <div className="order-total">
                <strong>Total:</strong>
                <span className="total-amount">
                  ₹ {order.total.toLocaleString()}
                </span>
              </div>

              {/* STATUS UPDATE */}
              <div className="order-status-update">
                <label>Update Status:</label>
                <select
                  value={order.track}
                  disabled={updatingId === order.id}
                  onChange={(e) =>
                    updateOrderStatus(order.id, e.target.value)
                  }
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {updatingId === order.id && (
                  <span className="loading-small">Updating...</span>
                )}
              </div>

              {/* ADDRESS */}
              {order.shippingAddress && (
                <div className="shipping-address">
                  <h4>📮 Address</h4>
                  <p>
                    {typeof order.shippingAddress === "string"
                      ? order.shippingAddress
                      : `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`}
                  </p>
                </div>
              )}

              {/* ITEMS */}
              <div className="order-items">
                <h4>Items ({order.items.length})</h4>

                <div className="items-list">
                  {order.items.map((item) => (
                    <div
                      className="order-item"
                      key={item.product_id || item.id}
                    >
                      <img
                        src={item.image || item.main_image}
                        alt={item.title}
                      />

                      <div className="item-details">
                        <span className="item-title">
                          {item.title}
                        </span>
                        <span>Qty: {item.quantity}</span>
                        <span>
                          ₹ {Number(item.price || 0)}
                        </span>
                      </div>

                      <span className="item-total">
                        ₹{" "}
                        {Number(item.price || 0) *
                          (item.quantity || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;