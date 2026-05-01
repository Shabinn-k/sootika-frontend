import React, { useContext, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    addToCart,
    removeCart,
    updateCartItem,
    loading: cartLoading,
  } = useContext(CartContext);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      toast.warn("Please login to view cart");
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || cartLoading) {
    return (
      <div className="cart-page">
        <div className="loading-spinner">Loading cart...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleDecrement = (item) => {
    const cartItemId = item.cart_item_id || item.id;
    const currentQty = item.quantity || 1;
    
    if (currentQty > 1) {
      updateCartItem(cartItemId, { quantity: currentQty - 1 });
    } else {
      removeCart(cartItemId);
    }
  };

  const handleIncrement = (item) => {
    const cartItemId = item.cart_item_id || item.id;
    const currentQty = item.quantity || 1;
    updateCartItem(cartItemId, { quantity: currentQty + 1 });
  };

  const handleRemove = (item) => {
    const cartItemId = item.cart_item_id || item.id;
    removeCart(cartItemId);
  };

  const subtotal = (cartItems || []).reduce(
    (acc, item) =>
      acc + Number(item.price || 0) * (item.quantity || 1),
    0
  );

  const shipping = (cartItems?.length || 0) > 0 ? 80 : 0;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      {(cartItems?.length || 0) === 0 ? (
        <div className="empty-msg-container">
          <h2 className="empty-msg">Your cart is empty</h2>
          <button className="home-btn" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      ) : (
        <>
          <h1 className="cart-title">Your Cart Items</h1>

          {cartItems.map((item) => {
            const cartItemId = item.cart_item_id || item.id;
            const quantity = item.quantity || 1;

            return (
              <div key={cartItemId} className="cart-card">
                <img
                  src={item.image || item.main_image}
                  alt={item.title || "Product"}
                  width={150}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />

                <div className="cart-info">
                  <h3>{item.title || "No title"}</h3>
                  <span>₹ {item.price || 0}</span>
                </div>

                <div className="cart-qty">
                  <button
                    disabled={cartLoading}
                    onClick={() => handleDecrement(item)}
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    disabled={cartLoading}
                    onClick={() => handleIncrement(item)}
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={cartLoading}
                  className="remove-btn"
                  onClick={() => handleRemove(item)}
                >
                  Remove
                </button>
              </div>
            );
          })}

          <div className="payment-summary">
            <h2>Order Summary</h2>

            <div className="payment-row">
              <span>Subtotal</span>
              <span>₹ {subtotal}</span>
            </div>

            <div className="payment-row">
              <span>Shipping</span>
              <span>₹ {shipping}</span>
            </div>

            <div className="payment-row total">
              <span>Total</span>
              <span>₹ {total}</span>
            </div>

            <button
              className="pay-btn"
              disabled={(cartItems?.length || 0) === 0}
              onClick={() => navigate("/payment")}
            >
              Proceed to Payment
            </button>
          </div>

          <button
            className="home-btn large"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;