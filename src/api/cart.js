import { api, initAuth } from "./Axios";

export const cartService = {
  getCart: async () => {
    try {
      await initAuth();
      const res = await api.get("/cart/");
      return { data: res.data?.items || [], success: true };
    } catch (error) {
      return { data: [], success: false, error: error.response?.status === 401 ? "Please login again" : error.message };
    }
  },

  getCartCount: async () => {
    try {
      await initAuth();
      const res = await api.get("/cart/count");
      return { data: res.data?.count ?? 0, success: true };
    } catch (error) {
      return { data: 0, success: false };
    }
  },

  addToCart: async (itemData) => {
    try {
      await initAuth();
      const res = await api.post("/cart/add", itemData);
      return { data: res.data, success: true };
    } catch (error) {
      throw new Error(error.response?.status === 401 ? "Please login to add to cart" : error.response?.data?.message || "Failed to add to cart");
    }
  },

  updateCartItem: async (itemId, data) => {
    try {
      await initAuth();
      const res = await api.put(`/cart/update/${itemId}`, data);
      return { data: res.data, success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to update cart" };
    }
  },

  removeFromCart: async (itemId) => {
    try {
      await initAuth();
      const res = await api.delete(`/cart/remove/${itemId}`);
      return { data: res.data, success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to remove from cart" };
    }
  },

  clearCart: async () => {
    try {
      await initAuth();
      const res = await api.delete("/cart/clear");
      return { data: res.data, success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to clear cart" };
    }
  }
};