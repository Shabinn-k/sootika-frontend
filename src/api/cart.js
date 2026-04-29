// api/cart.js
import { api } from "./Axios";

export const cartService = {
  // Get cart - handle backend response structure
  getCart: async () => {
    const res = await api.get("/cart/");
    // Backend returns: { message, cart: { id, user_id, items } }
    return { data: res.data.cart?.items || [] };
  },

  getCartCount: async () => {
    const res = await api.get("/cart/count");
    return { data: res.data.count };
  },

  getCartTotal: async () => {
    const res = await api.get("/cart/total");
    return { data: res.data.total };
  },

  addToCart: (itemData) => api.post("/cart/add", itemData),

  updateCartItem: (itemId, data) => api.put(`/cart/update/${itemId}`, data),

  removeFromCart: (itemId) => api.delete(`/cart/remove/${itemId}`),

  clearCart: () => api.delete("/cart/clear"),
};