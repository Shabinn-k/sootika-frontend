import { createContext, useEffect, useState } from "react";
import { cartService } from "../api/cart";
import { wishlistService } from "../api/wishlist";
import { useAuth } from "../Authentication/AuthContext";
import { toast } from "react-toastify";

export const CartContext = createContext(null);

const CartContextProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [wishItems, setWishItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setCartItems([]);
      setWishItems([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const cartRes = await cartService.getCart();

        let cartData = [];
        if (Array.isArray(cartRes.data)) {
          cartData = cartRes.data;
        } else if (cartRes.data?.items) {
          cartData = cartRes.data.items;
        } else if (cartRes.data?.cart?.items) {
          cartData = cartRes.data.cart.items;
        }

        const mappedCart = cartData.map(item => ({
          ...item,
          cart_item_id: item.id,
          product_id: item.product_id || item.Product?.id,
          id: item.product_id || item.id,
          title: item.title || item.Product?.title,
          price: item.price || item.Product?.price,
          image: item.main_image || item.Product?.main_image,
          quantity: item.quantity || 1
        }));

        setCartItems(mappedCart);

        const wishRes = await wishlistService.getWishlist();

        let wishData = [];
        if (Array.isArray(wishRes.data)) {
          wishData = wishRes.data;
        } else if (wishRes.data?.items) {
          wishData = wishRes.data.items;
        }

        const mappedWish = wishData.map(item => ({
          ...item,
          product: item.product || item,
          id: item.product?.id || item.product_id || item.id,
          title: item.product?.title || item.title,
          price: item.product?.price || item.price,
          image: item.product?.main_image || item.image
        }));

        setWishItems(mappedWish);

      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 401) {
          setCartItems([]);
          setWishItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);
 
const fetchCart = async () => {
  if (!user || authLoading) return;

  try {
    const cartRes = await cartService.getCart();
    const cartData = Array.isArray(cartRes.data) ? cartRes.data : [];
    
   const mappedCart = cartData.map(item => ({
  ...item,
  cart_item_id: item.id,
  product_id: item.product_id || item.Product?.id,
  id: item.product_id || item.id, 
  title: item.title || item.Product?.title || item.product?.title || "Product",
  price: item.price || item.Product?.price || item.product?.price || 0,
  image: item.image || item.main_image || item.Product?.main_image || item.product?.main_image,
  quantity: item.quantity || 1
}));
    
    console.log("Mapped cart items with details:", mappedCart);
    setCartItems(mappedCart);
  } catch (err) {
    console.error("Fetch cart error:", err);
  }
};


  const addToCart = async (item) => {
    if (!user) {
      toast.warn("Please login to add items to cart!");
      return;
    }

    const productId = item.id || item.product_id;
    
    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    try {
      await cartService.addToCart({
        product_id: productId,
        quantity: 1
      });
      
      await fetchCart();
      toast.success("Added to cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error(err.response?.data?.error || "Failed to add to cart");
    }
  };

  const removeCart = async (cartItemId) => {
    if (!cartItemId) {
      toast.error("Invalid cart item ID");
      return;
    }
    
    try {
      await cartService.removeFromCart(cartItemId);
      setCartItems(prev => prev.filter(item => item.cart_item_id !== cartItemId));
      toast.info("Removed from cart");
    } catch (err) {
      console.error("Remove error:", err);
      toast.error("Failed to remove");
    }
  };

  const updateCartItem = async (cartItemId, data) => {
    if (!cartItemId) {
      toast.error("Invalid item ID");
      return;
    }
    
    try {
      await cartService.updateCartItem(cartItemId, data);
      await fetchCart();
      toast.success("Cart updated");
    } catch (err) {
      console.error("Update cart error:", err);
      toast.error(err.response?.data?.error || "Failed to update cart");
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
      toast.info("Cart cleared");
    } catch {
      toast.error("Failed");
    }
  };

  const addToWish = async (item) => {
    if (!user) {
      toast.warn("Login required");
      return;
    }

    const productId = item.product?.id || item.product_id || item.id;

    try {
      await wishlistService.addToWishlist({ product_id: productId });
      await fetchWishlist();
      toast.success("Added to wishlist");
    } catch {
      toast.error("Failed to add");
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await wishlistService.getWishlist();
      let data = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (res.data?.items) data = res.data.items;

      const mapped = data.map(item => ({
        ...item,
        product: item.product || item,
        id: item.product?.id || item.product_id || item.id,
        title: item.product?.title || item.title,
        price: item.product?.price || item.price,
        image: item.product?.main_image || item.image
      }));

      setWishItems(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  const removeWish = async (item) => {
    const id = item.product?.id || item.product_id || item.id;

    try {
      await wishlistService.removeFromWishlist(id);
      setWishItems(prev =>
        prev.filter(i => (i.product?.id !== id) && (i.product_id !== id))
      );
      toast.info("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishItems,
        addToCart,
        removeCart,
        clearCart,
        addToWish,
        updateCartItem,
        removeWish,
        fetchCart,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;