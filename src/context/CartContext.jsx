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
        
        // Map cart items to include image field
        const mappedCart = (cartRes.data || []).map(item => ({
          ...item,
          image: item.main_image || item.image
        }));
        
        setCartItems(mappedCart);
        setWishItems(wishRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [user]);

  const addToCart = async (item) => {
    if (!user) {
      toast.warn("Please login to add items to cart!");
      return;
    }

    try {
      await cartService.addToCart({ product_id: item.id, quantity: item.quantity || 1 });
      
      setCartItems((prev) => {
        const exist = prev.find((p) => p.product_id === item.id || p.id === item.id);
        if (exist) {
          return prev.map((p) =>
            p.product_id === item.id || p.id === item.id
              ? { ...p, quantity: p.quantity + (item.quantity || 1), image: p.main_image || p.image }
              : p
          );
        } else {
          return [...prev, { 
            ...item, 
            product_id: item.id, 
            quantity: item.quantity || 1,
            image: item.main_image || item.image
          }];
        }
      });
      
      toast.success("Cart updated");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const removeCart = async (id) => {
    try {
      await cartService.removeFromCart(id);
      setCartItems((prev) => prev.filter((item) => item.product_id !== id && item.id !== id));
      toast.info("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove from cart");
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
      toast.info("Cart cleared");
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  const addToWish = async (item) => {
    if (!user) {
      toast.warn("Please login to add items");
      return;
    }

    try {
      await wishlistService.addToWishlist({ product_id: item.id });
      setWishItems((prev) => [...prev, { ...item, image: item.main_image || item.image }]);
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error("Failed to add to wishlist");
    }
  };

  const removeWish = async (id) => {
    try {
      await wishlistService.removeFromWishlist(id);
      setWishItems((prev) => prev.filter((item) => item.product_id !== id && item.id !== id));
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