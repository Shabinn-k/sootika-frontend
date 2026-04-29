import { useContext, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeCart } = useContext(CartContext);
  const { user } = useAuth();

  // 🔒 Guard route (side-effect safe)
  useEffect(() => {
    if (!user) {
      toast.warn("Please login to view cart");
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return null;

  // 🧮 Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shipping = cartItems.length > 0 ? 80 : 0;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      {cartItems.length === 0 ? (
        <div className="empty-msg-container">
          <h2 className="empty-msg">Your cart is empty</h2>
          <button className="home-btn" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      ) : (
        <>
          <h1 className="cart-title">Your Cart Items</h1>

          {cartItems.map((item) => (
            <div key={item.id} className="cart-card">
              <img src={item.image} alt={item.title} width={150} />

              <div className="cart-info">
                <h3>{item.title}</h3>
                <h2>{item.name}</h2>
                <span>₹ {item.price}</span>
              </div>

              <div className="cart-qty">
                <button
                  onClick={() =>
                    item.quantity > 1 &&
                    addToCart({ ...item, quantity: -1 })
                  }
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    addToCart({ ...item, quantity: 1 })
                  }
                >
                  +
                </button>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          {/* 💳 ORDER SUMMARY */}
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
