import { createContext, useEffect, useState } from "react";
import { cartService } from "../api/cart";
import { wishlistService } from "../api/wishlist";
import { useAuth } from "../Authentication/AuthContext";
import { toast } from "react-toastify";

export const CartContext = createContext(null);

const CartContextProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [wishItems, setWishItems] = useState([]);

  /* =====================
     FETCH CART / WISHLIST
  ===================== */
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setWishItems([]);
      return;
    }

    const fetchData = async () => {
      try {
        const cartRes = await cartService.getCart();
        const wishRes = await wishlistService.getWishlist();
        
        setCartItems(cartRes.data || []);
        setWishItems(wishRes.data || []);
      } catch (err) {
        console.error(err);
        // Optional: fail silently or show error
      }
    };

    fetchData();
  }, [user]);

  /* =====================
     CART
  ===================== */
  const addToCart = async (item) => {
    if (!user) {
      toast.warn("Please login to add items to cart!");
      return;
    }

    try {
      await cartService.addToCart({ product_id: item.id, quantity: item.quantity || 1 });
      
      // Update local state or re-fetch cart
      setCartItems((prev) => {
        const exist = prev.find((p) => p.product_id === item.id);
        if (exist) {
          return prev.map((p) =>
            p.product_id === item.id
              ? { ...p, quantity: p.quantity + (item.quantity || 1) }
              : p
          );
        } else {
          return [...prev, { ...item, product_id: item.id, quantity: item.quantity || 1 }];
        }
      });
      
      toast.dismiss();
      toast.success("Cart updated");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const removeCart = async (id) => {
    try {
      await cartService.removeFromCart(id);
      setCartItems((prev) => prev.filter((item) => item.product_id !== id && item.id !== id));
      toast.dismiss();
      toast.info("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove from cart");
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
      toast.dismiss();
      toast.info("Cart cleared");
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  /* =====================
     WISHLIST
  ===================== */
  const addToWish = async (item) => {
    if (!user) {
      toast.warn("Please login to add items");
      return;
    }

    try {
      await wishlistService.addToWishlist({ product_id: item.id });
      setWishItems((prev) => [...prev, item]);
      toast.dismiss();
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error("Failed to add to wishlist");
    }
  };

  const removeWish = async (id) => {
    try {
      await wishlistService.removeFromWishlist(id);
      setWishItems((prev) => prev.filter((item) => item.product_id !== id && item.id !== id));
      toast.dismiss();
      toast.info("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove from wishlist");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeCart,
        clearCart,
        wishItems,
        addToWish,
        removeWish,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;
