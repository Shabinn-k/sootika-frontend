import React, { useContext, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Authentication/AuthContext";
import { toast } from "react-toastify";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();

  const {
    wishItems,
    removeWish,
    addToCart,
    loading: cartLoading,
  } = useContext(CartContext);

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
    const product = item.product || item;

    const productId = product.id;

    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    const isOutOfStock =
      product.stock === false || product.stock === 0;

    if (isOutOfStock) {
      toast.error("Out of stock");
      return;
    }

    try {
      await addToCart(product);

      await removeWish(item);

      toast.success("Moved to cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to move item");
    }
  };

  const handleRemove = async (item) => {
    try {
      await removeWish(item);
      toast.info("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
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

          {wishItems.map((item, index) => {
            const product = item.product || item;

            const id = product.id || item.product_id || index;

            const isOutOfStock =
              product.stock === false || product.stock === 0;

            return (
              <div className="wish-card" key={id}>
                <img
                  src={product.main_image || product.image}
                  alt={product.title || "Product"}
                  width={150}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />

                <div className="wish-info">
                  <h3>{product.title || "No title"}</h3>
                  <span>₹ {product.price || 0}</span>

                  {isOutOfStock && (
                    <p className="stock out">Out of Stock</p>
                  )}
                </div>

                <div className="btns">
                  <button
                    className="tocart-btn"
                    onClick={() => handleMoveToCart(item)}
                    disabled={isOutOfStock || cartLoading}
                  >
                    Add to Cart
                  </button>

                  <button
                    disabled={cartLoading}
                    className="remove-btn"
                    onClick={() => handleRemove(item)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

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

export default Wishlist;