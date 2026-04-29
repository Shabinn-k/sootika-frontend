import React, { useEffect, useState } from "react";
import Layout from "../../Components/Layout";
import { api } from "../../../api/Axios";
import { toast } from "react-toastify";
import "./AdminOrders.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  /* =====================
     FETCH ALL ORDERS
  ===================== */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/users");

      const list = res.data.flatMap((user) =>
        (user.orders || []).map((order) => ({
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          orderId: order.orderId,
          date: order.date,
          track: order.track,
          items: order.items || [],
          total: order.total,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
        }))
      );

      setOrders(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =====================
     UPDATE ORDER STATUS
  ===================== */
  const updateOrder = async (userId, orderId, newTrack) => {
    try {
      setLoadingId(orderId);

      const res = await api.get(`/users/${userId}`);
      const user = res.data;

      const updatedOrders = (user.orders || []).map((order) =>
        order.orderId === orderId
          ? { ...order, track: newTrack }
          : order
      );

      await api.patch(`/users/${userId}`, {
        orders: updatedOrders,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId
            ? { ...order, track: newTrack }
            : order
        )
      );

      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Layout>
      <div className="admin-orders">
        <h2>All Orders</h2>

        {orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          orders.map((order) => (
            <div
              className="order-card"
              key={`${order.userId}-${order.orderId}`}
            >
              {/* USER INFO */}
              <p><b>User:</b> {order.userName}</p>
              <p><b>Phone:</b> {order.userPhone || "N/A"}</p>

              {/* ORDER INFO */}
              <p><b>Order ID:</b> #{order.orderId}</p>
              <p><b>Date:</b> {order.date}</p>
              <p>
                <b>Payment:</b>{" "}
                {order.paymentMethod
                  ? order.paymentMethod.toUpperCase()
                  : "N/A"}
              </p>

              <h3 className="ppp">Total: ₹ {order.total}</h3>

              {/* ORDER STATUS */}
              <label>Status:</label>
              <select
                value={order.track}
                disabled={loadingId === order.orderId}
                onChange={(e) =>
                  updateOrder(order.userId, order.orderId, e.target.value)
                }
              >
                <option>Pending</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>

              {/* DELIVERY ADDRESS */}
              {order.shippingAddress && (
                <>
                  <h4>Delivery Address</h4>
                  <p>
                    {order.shippingAddress.address}, <br />
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                </>
              )}

              {/* ITEMS */}
              <h4>Items</h4>
              {order.items.map((item) => (
                <p key={item.id}>
                  ● {item.title} × {item.quantity} — ₹{" "}
                  {item.price * item.quantity}
                </p>
              ))}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;
