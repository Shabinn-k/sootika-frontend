import React, { useEffect, useState } from "react";
import "./Orders.css";
import { api } from "../../api/Axios";
import { useAuth } from "../../Authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  // 🔒 Guard + Fetch orders
  useEffect(() => {
    if (!user) {
      toast.warn("Please login to view orders");
      navigate("/");
      return;
    }

    api
      .get(`/users/${user.id}`)
      .then((res) => {
        setOrders(res.data.orders || []);
      })
      .catch(() => toast.error("Failed to load orders"));
  }, [user, navigate]);

  // Track status class
  const getTrackClass = (track) => track?.toLowerCase();

  return (
    <div className="orders-page">
      <button className="btnHome" onClick={() => navigate("/")}>
        Go Home
      </button>

      <h2 className="orders-title">My Orders</h2>

      {orders.length === 0 ? (
        <div className="orders-empty-wrapper">
          <p className="no-orders">You have no orders yet.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.orderId}>
            {/* HEADER */}
            <div className="order-header">
              <h3>Order #{order.orderId}</h3>
              <span className={`order-track ${getTrackClass(order.track)}`}>
                {order.track}
              </span>
            </div>

            {/* DATE */}
            <p className="order-date">{order.date}</p>

            {/* ITEMS */}
            {order.items?.map((item) => (
              <div className="order-item" key={item.id}>
                <img src={item.image} alt={item.title} />

                <div className="order-item-info">
                  <h4>{item.title}</h4>
                  <p>Qty: {item.quantity}</p>
                  <p>₹ {item.price}</p>
                </div>

                <p className="item-total">
                  ₹ {item.price * item.quantity}
                </p>
              </div>
            ))}

            {/* FOOTER */}
            <div className="order-footer">
              <h3>Total Paid: ₹ {order.total}</h3>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
