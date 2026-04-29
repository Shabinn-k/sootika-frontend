import { useContext, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishItems, removeWish, addToCart } = useContext(CartContext);
  const { user } = useAuth();

  // 🔒 Guard route (side-effect safe)
  useEffect(() => {
    if (!user) {
      toast.warn("Please login to view wishlist");
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleMoveToCart = async (item) => {
    try {
      await addToCart(item);
      removeWish(item.id);
      toast.success("Moved to cart");
    } catch {
      toast.error("Failed to move item");
    }
  };

  return (
    <div className="wish-page">
      {wishItems.length === 0 ? (
        <div className="empty-msg-container">
          <h2 className="empty-msg">Your wishlist is empty</h2>
          <button className="home-btn" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      ) : (
        <>
          <h1 className="wishlist-title">Your Wishlist</h1>

          {wishItems.map((item) => (
            <div className="wish-card" key={item.id}>
              <img src={item.image} alt={item.title} width={150} />

              <div className="wish-info">
                <h3>{item.title}</h3>
                <h2>{item.name}</h2>
                <span>₹ {item.price}</span>
              </div>

              <div className="btns">
                <button
                  className="tocart-btn"
                  onClick={() => handleMoveToCart(item)}
                >
                  Add to Cart
                </button>

                <button
                  className="remove-btn"
                  onClick={() => removeWish(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button className="home-btn" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </>
      )}
    </div>
  );
};

export default Wishlist;
