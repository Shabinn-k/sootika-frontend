import React, { useContext, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishItems, removeWish, addToCart, loading: cartLoading } = useContext(CartContext);  
  const { user, loading: authLoading } = useAuth(); 

  useEffect(() => {
    if (!authLoading && !user) {
      toast.warn("Please login to view wishlist");
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || cartLoading) {
    return (
      <div className="wish-page">
        <div className="loading-spinner">Loading wishlist...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleMoveToCart = async (item) => {
    const isOutOfStock = item.stock === false || item.stock === 0;
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }
    
   try {
  await addToCart({ ...item, quantity: 1 });
  await removeWish(item.product_id);
  toast.success("Moved to cart");
} catch (err) {
  toast.error("Failed to move item");
}
  };

  const hasItems = (wishItems?.length || 0) > 0;

  return (
    <div className="wish-page">
      {!hasItems ? (
        <div className="empty-msg-container">
          <h2 className="empty-msg">Your wishlist is empty</h2>
          <button className="home-btn" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      ) : (
        <>
          <h1 className="wishlist-title">Your Wishlist</h1>

          {wishItems.map((item) => {
            const isOutOfStock = item.stock === false || item.stock === 0;
            
            return (
              <div className="wish-card" key={item.id || item.product_id}>
                <img 
                  src={item.main_image || item.image} 
                  alt={item.title} 
                  width={150}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />

                <div className="wish-info">
                  <h3>{item.title}</h3>
                  <h2>{item.name}</h2>
                  <span>₹ {item.price}</span>
                  {isOutOfStock && (
                    <p className="stock out">Out of Stock</p>
                  )}
                </div>

                <div className="btns">
                  <button
                    className="tocart-btn"
                    onClick={() => handleMoveToCart(item)}
                    disabled={isOutOfStock} >
                    Add to Cart
                  </button>
                  <button disabled={cartLoading}
                    className="remove-btn"
                    onClick={() => removeWish(item.product_id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          
          <button className="home-btn large" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </>
      )}
    </div>
  );
};

export default Wishlist;