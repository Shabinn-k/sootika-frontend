import { api, initAuth } from "./Axios";

export const wishlistService = {
  getWishlist: async () => {
    try {
      await initAuth();
      const res = await api.get("/wishlist/");
      return { data: res.data?.wishlist?.items || [], success: true };
    } catch (error) {
      return { data: [], success: false, error: error.response?.status === 401 ? "Please login again" : error.message };
    }
  },

  getWishlistCount: async () => {
    try {
      await initAuth();
      const res = await api.get("/wishlist/count");
      return { data: res.data?.count ?? 0, success: true };
    } catch (error) {
      return { data: 0, success: false };
    }
  },

  addToWishlist: async (data) => {
    try {
      await initAuth();
      const res = await api.post("/wishlist/add", data);
      return { data: res.data, success: true };
    } catch (error) {
      throw new Error(error.response?.status === 401 ? "Please login to add to wishlist" : error.response?.data?.message || "Failed to add to wishlist");
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      await initAuth();
      const res = await api.delete(`/wishlist/remove/${productId}`);
      return { data: res.data, success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to remove from wishlist" };
    }
  },

  clearWishlist: async () => {
    try {
      await initAuth();
      const res = await api.delete("/wishlist/clear");
      return { data: res.data, success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to clear wishlist" };
    }
  }
};